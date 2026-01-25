package db

import (
	"context"
	"database/sql"
	"encoding/json"
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
	cond := table.Discussions.ID.EQ(mysql.String(params.ID)).
		AND(table.Discussions.WorkspaceID.EQ(mysql.String(params.WorkspaceID)))

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

func (r *DiscussionRepository) Search(ctx context.Context, params domain.SearchDiscussionsParams) ([]*domain.Discussion, error) {
	cond := table.Discussions.WorkspaceID.EQ(mysql.String(params.WorkspaceID))

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

func (r *DiscussionRepository) Save(ctx context.Context, d *domain.Discussion) error {
	discussionModel := r.toDiscussionModel(d)

	stmt := table.Discussions.
		INSERT(table.Discussions.AllColumns.Except(
			table.Discussions.UpdatedAt,
		)).
		MODEL(discussionModel).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Discussions.Theme.SET(table.Discussions.NEW.Theme),
			table.Discussions.Conclusion.SET(table.Discussions.NEW.Conclusion),
			table.Discussions.Status.SET(table.Discussions.NEW.Status),
			table.Discussions.CommentsCount.SET(table.Discussions.NEW.CommentsCount),
			table.Discussions.LastCommentedAt.SET(table.Discussions.NEW.LastCommentedAt),
			table.Discussions.ArchivedAt.SET(table.Discussions.NEW.ArchivedAt),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save discussion: %w", err)
	}

	if d.Status() == domain.DiscussionStatusPublic {
		settingsModel, err := r.toDialogueSettingsModel(d.ID(), d.DialogueSettings())
		if err != nil {
			return fmt.Errorf("failed to convert dialogue settings to model: %w", err)
		}

		settingsStmt := table.DialogueSettings.
			INSERT(table.DialogueSettings.AllColumns.Except(table.DialogueSettings.UpdatedAt, table.DialogueSettings.CreatedAt)).
			MODEL(settingsModel).
			AS_NEW().
			ON_DUPLICATE_KEY_UPDATE(
				table.DialogueSettings.CommentFrame.SET(table.DialogueSettings.NEW.CommentFrame),
			)

		if _, err := settingsStmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
			return fmt.Errorf("failed to save dialogue settings: %w", err)
		}
	} else {
		deleteStmt := table.DialogueSettings.
			DELETE().
			WHERE(table.DialogueSettings.DiscussionID.EQ(mysql.String(d.ID())))

		if _, err := deleteStmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
			return fmt.Errorf("failed to delete dialogue settings: %w", err)
		}
	}

	return nil
}

func (r *DiscussionRepository) Delete(ctx context.Context, d *domain.Discussion) error {
	stmt := table.Discussions.
		DELETE().
		WHERE(table.Discussions.ID.EQ(mysql.String(d.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete discussion: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) toDomain(row discussionWithSettings) (*domain.Discussion, error) {
	var dialogueSettings *domain.DialogueSettings
	if row.DialogueSettings != nil {
		settings, err := r.toDialogueSettingsDomain(row.DialogueSettings)
		if err != nil {
			return nil, err
		}
		dialogueSettings = settings
	}

	return r.fac.Reconstruct(domain.ReconstructDiscussionParams{
		ID: row.ID,
		CreateDiscussionParams: domain.CreateDiscussionParams{
			WorkspaceID: row.WorkspaceID,
			Theme:       row.Theme,
			Status:      domain.DiscussionStatus(row.Status),
			CreatedBy:   row.CreatedBy,
		},
		Conclusion:       row.Conclusion,
		CommentsCount:    int(row.CommentsCount),
		LastCommentedAt:  row.LastCommentedAt,
		ArchivedAt:       row.ArchivedAt,
		CreatedAt:        row.CreatedAt,
		DialogueSettings: dialogueSettings,
	})
}

func (r *DiscussionRepository) toDialogueSettingsDomain(row *model.DialogueSettings) (*domain.DialogueSettings, error) {
	var commentFrame domain.CommentFrame
	if err := json.Unmarshal([]byte(row.CommentFrame), &commentFrame); err != nil {
		return nil, fmt.Errorf("failed to unmarshal comment frame: %w", err)
	}

	return &domain.DialogueSettings{
		CommentFrame: commentFrame,
	}, nil
}

func (r *DiscussionRepository) toDiscussionModel(d *domain.Discussion) model.Discussions {
	return model.Discussions{
		ID:              d.ID(),
		WorkspaceID:     d.WorkspaceID(),
		Theme:           d.Theme(),
		Conclusion:      d.Conclusion(),
		Status:          string(d.Status()),
		CommentsCount:   int32(d.CommentsCount()),
		LastCommentedAt: d.LastCommentedAt(),
		ArchivedAt:      d.ArchivedAt(),
		CreatedBy:       d.CreatedBy(),
		CreatedAt:       d.CreatedAt(),
	}
}

func (r *DiscussionRepository) toDialogueSettingsModel(discussionID string, settings *domain.DialogueSettings) (model.DialogueSettings, error) {
	commentFrameJSON, err := json.Marshal(settings.CommentFrame)
	if err != nil {
		return model.DialogueSettings{}, fmt.Errorf("failed to marshal comment frame: %w", err)
	}

	return model.DialogueSettings{
		DiscussionID: discussionID,
		CommentFrame: string(commentFrameJSON),
	}, nil
}
