package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/go-jet/jet/v2/mysql"
	"github.com/go-jet/jet/v2/qrm"
)

type CommentRepository struct {
	db  *sql.DB
	fac *domain.CommentFactory
}

func NewCommentRepository(db *sql.DB, fac *domain.CommentFactory) *CommentRepository {
	return &CommentRepository{db: db, fac: fac}
}

func (r *CommentRepository) Load(ctx context.Context, id string) (*domain.Comment, error) {
	stmt := r.selectCommentWithIssues().
		WHERE(table.Comments.ID.EQ(mysql.String(id)))

	var dest commentModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load comment: %w", err)
	}

	return r.toCommentDomain(dest.Comments, dest.Issues)
}

func (r *CommentRepository) Search(ctx context.Context, params domain.SearchCommentsParams) ([]*domain.Comment, error) {
	cond := table.Comments.DiscussionID.EQ(mysql.String(params.DiscussionID))
	if !params.Since.IsZero() {
		cond = cond.AND(table.Comments.CreatedAt.GT(mysql.TimestampT(params.Since)))
	}

	stmt := r.selectCommentWithIssues().
		WHERE(cond)

	var dest []commentModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}

	return r.toCommentDomains(dest)
}

func (r *CommentRepository) Create(ctx context.Context, c *domain.Comment) error {
	m := r.toCommentModel(c)
	stmt := table.Comments.
		INSERT(table.Comments.AllColumns.Except(table.Comments.UpdatedAt)).
		MODEL(m)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to create comment: %w", err)
	}

	return r.saveCommentIssues(ctx, c.ID(), c.Issues())
}

func (r *CommentRepository) Update(ctx context.Context, c *domain.Comment) error {
	m := r.toCommentModel(c)
	stmt := table.Comments.
		UPDATE(
			table.Comments.ParentCommentID,
			table.Comments.Type,
			table.Comments.Content,
			table.Comments.Status,
			table.Comments.ArchivedAt,
		).
		MODEL(m).
		WHERE(table.Comments.ID.EQ(mysql.String(c.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to update comment: %w", err)
	}

	if err := r.deleteCommentIssues(ctx, c.ID()); err != nil {
		return err
	}

	return r.saveCommentIssues(ctx, c.ID(), c.Issues())
}

func (r *CommentRepository) BatchCreate(ctx context.Context, comments []*domain.Comment) error {
	if len(comments) == 0 {
		return nil
	}

	models := make([]model.Comments, len(comments))
	for i, c := range comments {
		models[i] = r.toCommentModel(c)
	}

	stmt := table.Comments.
		INSERT(table.Comments.AllColumns.Except(table.Comments.UpdatedAt)).
		MODELS(models)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to batch create comments: %w", err)
	}

	return r.saveCommentIssuesBatch(ctx, comments)
}

func (r *CommentRepository) Delete(ctx context.Context, c *domain.Comment) error {
	stmt := table.Comments.
		DELETE().
		WHERE(table.Comments.ID.EQ(mysql.String(c.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}

func (r *CommentRepository) DeleteByDiscussionID(ctx context.Context, discussionID string) error {
	stmt := table.Comments.
		DELETE().
		WHERE(table.Comments.DiscussionID.EQ(mysql.String(discussionID)))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete comments by discussion ID: %w", err)
	}

	return nil
}

func (r *CommentRepository) GetPathToRoot(ctx context.Context, commentID string) ([]*domain.Comment, error) {
	ancestors := mysql.CTE("ancestors")

	parentCommentID := table.Comments.ParentCommentID.From(ancestors)

	initialSelect := mysql.
		SELECT(table.Comments.AllColumns).
		FROM(table.Comments).
		WHERE(table.Comments.ID.EQ(mysql.String(commentID)))

	recursiveSelect := mysql.
		SELECT(table.Comments.AllColumns).
		FROM(
			table.Comments.
				INNER_JOIN(ancestors, table.Comments.ID.EQ(parentCommentID)),
		)

	stmt := mysql.
		WITH_RECURSIVE(ancestors.AS(initialSelect.UNION_ALL(recursiveSelect)))(
		mysql.SELECT(ancestors.AllColumns()).
			FROM(ancestors),
	)

	var dest []commentModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch path to root: %w", err)
	}

	return r.toCommentDomains(dest)
}

func (r *CommentRepository) ListChildren(ctx context.Context, params domain.ListCommentChildrenParams) ([]*domain.Comment, error) {
	var condition mysql.BoolExpression
	if params.ParentCommentID == "" {
		condition = table.Comments.DiscussionID.EQ(mysql.String(params.DiscussionID)).
			AND(table.Comments.ParentCommentID.IS_NULL())
	} else {
		condition = table.Comments.ParentCommentID.EQ(mysql.String(params.ParentCommentID))
	}

	if params.CommentType != "" {
		condition = condition.AND(table.Comments.Type.EQ(mysql.String(params.CommentType)))
	}

	stmt := r.selectCommentWithIssues().
		WHERE(condition)

	var dest []commentModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch children: %w", err)
	}

	return r.toCommentDomains(dest)
}

func (r *CommentRepository) CountsByDiscussionID(ctx context.Context, discussionID string) (domain.DiscussionCounts, error) {
	commentsCountExpr := mysql.COUNT(mysql.DISTINCT(table.Comments.ID)).AS("counts.comments_count")
	proposedCountExpr := mysql.COUNT(
		mysql.DISTINCT(
			mysql.CASE().
				WHEN(table.Comments.Status.EQ(mysql.String(string(domain.CommentStatusProposed)))).
				THEN(table.Comments.ID).
				ELSE(mysql.NULL),
		),
	).AS("counts.proposed_comments_count")
	issuesCountExpr := mysql.COUNT(table.CommentIssues.ID).AS("counts.issues_count")

	stmt := mysql.
		SELECT(commentsCountExpr, proposedCountExpr, issuesCountExpr).
		FROM(
			table.Comments.
				LEFT_JOIN(table.CommentIssues, table.CommentIssues.CommentID.EQ(table.Comments.ID)),
		).
		WHERE(table.Comments.DiscussionID.EQ(mysql.String(discussionID)))

	var dest struct {
		CommentsCount         int64  `alias:"counts.comments_count"`
		ProposedCommentsCount *int64 `alias:"counts.proposed_comments_count"`
		IssuesCount           int64  `alias:"counts.issues_count"`
	}
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return domain.DiscussionCounts{}, fmt.Errorf("failed to count discussion stats: %w", err)
	}

	var proposedCount int
	if dest.ProposedCommentsCount != nil {
		proposedCount = int(*dest.ProposedCommentsCount)
	}

	return domain.DiscussionCounts{
		CommentsCount:         int(dest.CommentsCount),
		ProposedCommentsCount: proposedCount,
		IssuesCount:           int(dest.IssuesCount),
	}, nil
}

func (r *CommentRepository) RenameCommentType(ctx context.Context, discussionID, oldType, newType string) error {
	stmt := table.Comments.
		UPDATE(table.Comments.Type).
		SET(newType).
		WHERE(
			table.Comments.DiscussionID.EQ(mysql.String(discussionID)).
				AND(table.Comments.Type.EQ(mysql.String(oldType))),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to rename comment type: %w", err)
	}

	return nil
}

func (r *CommentRepository) toCommentDomains(rows []commentModel) ([]*domain.Comment, error) {
	comments := make([]*domain.Comment, len(rows))
	for i, row := range rows {
		c, err := r.toCommentDomain(row.Comments, row.Issues)
		if err != nil {
			return nil, fmt.Errorf("failed to convert comment domain: %w", err)
		}
		comments[i] = c
	}
	return comments, nil
}

func (r *CommentRepository) toCommentDomain(row model.Comments, issueRows []model.CommentIssues) (*domain.Comment, error) {
	issues := make([]domain.CommentIssue, len(issueRows))
	for i, ir := range issueRows {
		issues[i] = domain.CommentIssue{
			ID:          ir.ID,
			Title:       ir.Title,
			Description: ir.Description,
			CreatedBy:   ptrToString(ir.CreatedBy),
		}
	}
	return r.fac.Reconstruct(domain.ReconstructCommentParams{
		ID:              row.ID,
		DiscussionID:    row.DiscussionID,
		ParentCommentID: ptrToString(row.ParentCommentID),
		Body: domain.CommentBody{
			Type:    row.Type,
			Content: row.Content,
		},
		Status: domain.CommentStatus(row.Status),
		Activity: domain.CommentActivity{
			CreatedBy: ptrToString(row.CreatedBy),
			CreatedAt: row.CreatedAt,
			ArchivedAt: func() time.Time {
				if row.ArchivedAt != nil {
					return *row.ArchivedAt
				}
				return time.Time{}
			}(),
		},
		Issues: issues,
	})
}

type commentModel struct {
	model.Comments
	Issues []model.CommentIssues
}

func (r *CommentRepository) toCommentModel(c *domain.Comment) model.Comments {
	m := model.Comments{
		ID:           c.ID(),
		DiscussionID: c.DiscussionID(),
		Type:         c.Type(),
		Content:      c.Content(),
		Status:       string(c.Status()),
		CreatedAt:    c.CreatedAt(),
	}
	if id, ok := c.ParentCommentID(); ok {
		m.ParentCommentID = &id
	}
	if by, ok := c.CreatedBy(); ok {
		m.CreatedBy = &by
	}
	if t, ok := c.ArchivedAt(); ok {
		m.ArchivedAt = &t
	}
	return m
}

func (r *CommentRepository) selectCommentWithIssues() mysql.SelectStatement {
	return mysql.
		SELECT(
			table.Comments.AllColumns,
			table.CommentIssues.AllColumns,
		).
		FROM(
			table.Comments.
				LEFT_JOIN(table.CommentIssues, table.CommentIssues.CommentID.EQ(table.Comments.ID)),
		)
}

func (r *CommentRepository) toCommentIssueModels(commentID string, issues []domain.CommentIssue) []model.CommentIssues {
	issueModels := make([]model.CommentIssues, len(issues))
	for i, is := range issues {
		issueModels[i] = model.CommentIssues{
			ID:          is.ID,
			CommentID:   commentID,
			Title:       is.Title,
			Description: is.Description,
			CreatedBy:   new(is.CreatedBy),
		}
	}
	return issueModels
}

func (r *CommentRepository) saveCommentIssues(ctx context.Context, commentID string, issues []domain.CommentIssue) error {
	if len(issues) == 0 {
		return nil
	}
	issueModels := r.toCommentIssueModels(commentID, issues)
	stmtIssues := table.CommentIssues.
		INSERT(table.CommentIssues.AllColumns.Except(
			table.CommentIssues.CreatedAt,
			table.CommentIssues.UpdatedAt,
		)).
		MODELS(issueModels)
	if _, err := stmtIssues.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save comment issues: %w", err)
	}
	return nil
}

func (r *CommentRepository) deleteCommentIssues(ctx context.Context, commentID string) error {
	deleteIssuesStmt := table.CommentIssues.
		DELETE().
		WHERE(table.CommentIssues.CommentID.EQ(mysql.String(commentID)))
	if _, err := deleteIssuesStmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete existing comment issues: %w", err)
	}
	return nil
}

func (r *CommentRepository) saveCommentIssuesBatch(ctx context.Context, comments []*domain.Comment) error {
	var issueModels []model.CommentIssues
	for _, c := range comments {
		issueModels = append(issueModels, r.toCommentIssueModels(c.ID(), c.Issues())...)
	}
	if len(issueModels) == 0 {
		return nil
	}
	stmtIssues := table.CommentIssues.
		INSERT(table.CommentIssues.AllColumns.Except(
			table.CommentIssues.CreatedAt,
			table.CommentIssues.UpdatedAt,
		)).
		MODELS(issueModels)
	if _, err := stmtIssues.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save comment issues batch: %w", err)
	}
	return nil
}
