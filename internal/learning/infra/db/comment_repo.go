package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

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
	fac *domain.Factory
}

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) SetFactory(fac *domain.Factory) {
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

func (r *CommentRepository) List(ctx context.Context, discussionID string) ([]*domain.Comment, error) {
	stmt := mysql.
		SELECT(table.Comments.AllColumns).
		FROM(table.Comments).
		WHERE(table.Comments.DiscussionID.EQ(mysql.String(discussionID)))

	var dest []model.Comments
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to fetch comments: %w", err)
	}

	comments := make([]*domain.Comment, len(dest))
	for i, row := range dest {
		c, err := r.toCommentDomain(row)
		if err != nil {
			return nil, fmt.Errorf("failed to convert comment domain: %w", err)
		}
		comments[i] = c
	}

	return comments, nil
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
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save comment: %w", err)
	}
	return nil
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

func (r *CommentRepository) toCommentDomain(row model.Comments) (*domain.Comment, error) {
	return r.fac.BuildComment(domain.BuildCommentParams{
		ID: row.ID,
		NewCommentParams: domain.NewCommentParams{
			DiscussionID:    row.DiscussionID,
			ParentCommentID: row.ParentCommentID,
			CommentTypeID:   row.CommentType,
			Content:         row.Content,
			Status:          domain.CommentStatus(row.Status),
			PostedBy:        row.PostedBy,
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
		PostedBy:        c.PostedBy(),
		Status:          string(c.Status()),
		CreatedAt:       c.CreatedAt(),
	}
}
