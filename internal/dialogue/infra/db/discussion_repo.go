package db

import (
	"context"
	"database/sql"
	"encoding/json"
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

type DiscussionRepository struct {
	db  *sql.DB
	fac *domain.DiscussionFactory
}

func NewDiscussionRepository(db *sql.DB, fac *domain.DiscussionFactory) *DiscussionRepository {
	return &DiscussionRepository{db: db, fac: fac}
}

type discussionWithSettings struct {
	model.Discussions
	DialogueSettings *model.DialogueSettings
}

func (r *DiscussionRepository) Load(ctx context.Context, params domain.LoadDiscussionParams) (*domain.Discussion, error) {
	cond := table.Discussions.ID.EQ(mysql.String(params.ID))

	stmt := mysql.
		SELECT(
			table.Discussions.AllColumns,
			table.DialogueSettings.AllColumns,
		).
		FROM(
			table.Discussions.
				LEFT_JOIN(table.DialogueSettings, table.Discussions.ID.EQ(table.DialogueSettings.DiscussionID)),
		).
		WHERE(cond).
		LIMIT(1)

	var dest discussionWithSettings
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load discussion: %w", err)
	}

	return r.toDomain(dest)
}

func (r *DiscussionRepository) Search(ctx context.Context) ([]*domain.Discussion, error) {
	stmt := mysql.
		SELECT(
			table.Discussions.AllColumns,
			table.DialogueSettings.AllColumns,
		).
		FROM(
			table.Discussions.
				LEFT_JOIN(table.DialogueSettings, table.Discussions.ID.EQ(table.DialogueSettings.DiscussionID)),
		).
		WHERE(
			table.Discussions.Status.EQ(mysql.String("public")),
		).
		ORDER_BY(table.Discussions.CreatedAt.DESC())

	var dest []discussionWithSettings
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to list discussions: %w", err)
	}

	discussions := make([]*domain.Discussion, len(dest))
	for i, row := range dest {
		d, err := r.toDomain(row)
		if err != nil {
			return nil, err
		}
		discussions[i] = d
	}

	return discussions, nil
}

func (r *DiscussionRepository) toDomain(row discussionWithSettings) (*domain.Discussion, error) {
	settings, err := r.toDialogueSettingsDomain(row.DialogueSettings)
	if err != nil {
		return nil, err
	}

	return r.fac.Reconstruct(domain.ReconstructDiscussionParams{
		ID:              row.ID,
		Theme:           row.Theme,
		Conclusion:      row.Conclusion,
		Settings:        settings,
		CommentsCount:   int(row.CommentsCount),
		LastCommentedAt: row.LastCommentedAt,
		ArchivedAt:      row.ArchivedAt,
		CreatedBy:       row.CreatedBy,
		CreatedAt:       row.CreatedAt,
	})
}

func (r *DiscussionRepository) Save(ctx context.Context, d *domain.Discussion) error {
	stmt := table.Discussions.
		UPDATE(table.Discussions.CommentsCount, table.Discussions.LastCommentedAt).
		SET(
			mysql.Int(int64(d.CommentsCount())),
			d.LastCommentedAt(),
		).
		WHERE(table.Discussions.ID.EQ(mysql.String(d.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save discussion: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) toDialogueSettingsDomain(row *model.DialogueSettings) (domain.DiscussionSettings, error) {
	if row == nil {
		return domain.DiscussionSettings{}, nil
	}

	var commentFrame domain.CommentFrame
	if err := json.Unmarshal([]byte(row.CommentFrame), &commentFrame); err != nil {
		return domain.DiscussionSettings{}, fmt.Errorf("failed to unmarshal comment frame: %w", err)
	}

	return domain.DiscussionSettings{
		CommentFrame: commentFrame,
	}, nil
}
