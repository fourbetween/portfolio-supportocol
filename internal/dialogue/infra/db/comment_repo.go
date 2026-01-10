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

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) SetFactory(fac *domain.CommentFactory) {
	r.fac = fac
}

func (r *CommentRepository) Load(ctx context.Context, id string) (*domain.Comment, error) {
	stmt := mysql.
		SELECT(table.Comments.AllColumns).
		FROM(table.Comments).
		WHERE(table.Comments.ID.EQ(mysql.String(id)))

	var dest model.Comments
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load comment: %w", err)
	}

	return r.toCommentDomain(dest)
}

func (r *CommentRepository) Search(ctx context.Context, params domain.SearchCommentsParams) ([]*domain.Comment, error) {
	cond := table.Comments.DiscussionID.EQ(mysql.String(params.DiscussionID))
	if params.Since != nil {
		cond = cond.AND(table.Comments.CreatedAt.GT(mysql.TimestampT(*params.Since)))
	}

	stmt := mysql.
		SELECT(table.Comments.AllColumns).
		FROM(table.Comments).
		WHERE(cond)

	var dest []model.Comments
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}

	return r.toCommentDomains(dest)
}

func (r *CommentRepository) Save(ctx context.Context, c *domain.Comment) error {
	model := r.toCommentModel(c)

	stmt := table.Comments.
		INSERT(table.Comments.AllColumns.Except(table.Comments.UpdatedAt)).
		MODEL(model).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Comments.CommentType.SET(table.Comments.NEW.CommentType),
			table.Comments.Content.SET(table.Comments.NEW.Content),
			table.Comments.Status.SET(table.Comments.NEW.Status),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save comment: %w", err)
	}
	return nil
}

func (r *CommentRepository) toCommentDomains(rows []model.Comments) ([]*domain.Comment, error) {
	comments := make([]*domain.Comment, len(rows))
	for i, row := range rows {
		c, err := r.toCommentDomain(row)
		if err != nil {
			return nil, fmt.Errorf("failed to convert comment domain: %w", err)
		}
		comments[i] = c
	}
	return comments, nil
}

func (r *CommentRepository) toCommentDomain(row model.Comments) (*domain.Comment, error) {
	return r.fac.Reconstruct(domain.ReconstructCommentParams{
		ID: row.ID,
		CreateCommentParams: domain.CreateCommentParams{
			DiscussionID:    row.DiscussionID,
			ParentCommentID: row.ParentCommentID,
			CommentTypeID:   row.CommentType,
			Content:         row.Content,
			Status:          domain.CommentStatus(row.Status),
			CreatedBy:       row.CreatedBy,
		},
		CreatedAt: row.CreatedAt,
	})
}

func (r *CommentRepository) toCommentModel(c *domain.Comment) model.Comments {
	return model.Comments{
		ID:              c.ID(),
		DiscussionID:    c.DiscussionID(),
		ParentCommentID: c.ParentCommentID(),
		CommentType:     c.CommentType(),
		Content:         c.Content(),
		Status:          string(c.Status()),
		CreatedBy:       c.CreatedBy(),
		CreatedAt:       c.CreatedAt(),
	}
}
