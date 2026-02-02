package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db/schema/app-supportocol/table"
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
	if params.Since != nil {
		cond = cond.AND(table.Comments.CreatedAt.GT(mysql.TimestampT(*params.Since)))
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
	model := r.toCommentModel(c)

	stmt := table.Comments.
		INSERT(table.Comments.AllColumns.Except(table.Comments.UpdatedAt)).
		MODEL(model)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to create comment: %w", err)
	}

	return r.saveCommentIssues(ctx, c.ID(), c.Issues())
}

func (r *CommentRepository) Update(ctx context.Context, c *domain.Comment) error {
	m := r.toCommentModel(c)
	stmt := table.Comments.
		UPDATE(
			table.Comments.CommentType,
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
		mysql.SELECT(
			ancestors.AllColumns(),
			table.CommentIssues.AllColumns,
		).
			FROM(
				ancestors.
					LEFT_JOIN(table.CommentIssues, table.CommentIssues.CommentID.EQ(mysql.StringColumn("id").From(ancestors))),
			),
	)

	var dest []commentModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch path to root: %w", err)
	}

	return r.toCommentDomains(dest)
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
			IssueID:   ir.IssueID,
			Status:    domain.CommentIssueStatus(ir.Status),
			CreatedBy: ir.CreatedBy,
		}
	}
	return r.fac.Reconstruct(domain.ReconstructCommentParams{
		ID: row.ID,
		CreateCommentParams: domain.CreateCommentParams{
			DiscussionID:    row.DiscussionID,
			ParentCommentID: row.ParentCommentID,
			CommentTypeID:   row.CommentType,
			Content:         row.Content,
			Status:          domain.CommentStatus(row.Status),
			CreatedBy:       row.CreatedBy,
			Issues:          issues,
		},
		CreatedAt:  row.CreatedAt,
		ArchivedAt: row.ArchivedAt,
	})
}

type commentModel struct {
	model.Comments
	Issues []model.CommentIssues
}

func (r *CommentRepository) toCommentModel(c *domain.Comment) model.Comments {
	return model.Comments{
		ID:              c.ID(),
		DiscussionID:    c.DiscussionID(),
		ParentCommentID: c.ParentCommentID(),
		CommentType:     c.CommentType(),
		Content:         c.Content(),
		Status:          string(c.Status()),
		ArchivedAt:      c.ArchivedAt(),
		CreatedBy:       c.CreatedBy(),
		CreatedAt:       c.CreatedAt(),
	}
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
			CommentID: commentID,
			IssueID:   is.IssueID,
			Status:    string(is.Status),
			CreatedBy: is.CreatedBy,
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
