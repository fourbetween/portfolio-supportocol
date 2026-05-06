package db

import (
	"context"
	"database/sql"
	"encoding/json"
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

func (r *DiscussionRepository) Save(ctx context.Context, d *domain.Discussion) error {
	discussionModel := r.toDiscussionModel(d)

	stmt := table.Discussions.
		INSERT(table.Discussions.AllColumns.Except(
			table.Discussions.UpdatedAt,
		)).
		MODEL(discussionModel).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Discussions.ProjectID.SET(table.Discussions.NEW.ProjectID),
			table.Discussions.Theme.SET(table.Discussions.NEW.Theme),
			table.Discussions.Premise.SET(table.Discussions.NEW.Premise),
			table.Discussions.Conclusion.SET(table.Discussions.NEW.Conclusion),
			table.Discussions.Language.SET(table.Discussions.NEW.Language),
			table.Discussions.Status.SET(table.Discussions.NEW.Status),
			table.Discussions.CommentsCount.SET(table.Discussions.NEW.CommentsCount),
			table.Discussions.ProposedCommentsCount.SET(table.Discussions.NEW.ProposedCommentsCount),
			table.Discussions.IssuesCount.SET(table.Discussions.NEW.IssuesCount),
			table.Discussions.LastCommentedAt.SET(table.Discussions.NEW.LastCommentedAt),
			table.Discussions.ArchivedAt.SET(table.Discussions.NEW.ArchivedAt),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save discussion: %w", err)
	}

	if d.Status().RequiresDialogueSettings() {
		ds, ok := d.DialogueSettings()
		if !ok {
			return fmt.Errorf("dialogue settings is required but missing: %w", apperr.ErrInvalidArgument)
		}
		settingsModel, err := r.toDialogueSettingsModel(d.ID(), ds)
		if err != nil {
			return fmt.Errorf("failed to convert dialogue settings to model: %w", err)
		}

		settingsStmt := table.DialogueSettings.
			INSERT(table.DialogueSettings.AllColumns.Except(table.DialogueSettings.UpdatedAt, table.DialogueSettings.CreatedAt)).
			MODEL(settingsModel).
			AS_NEW().
			ON_DUPLICATE_KEY_UPDATE(
				table.DialogueSettings.CommentFrame.SET(table.DialogueSettings.NEW.CommentFrame),
				table.DialogueSettings.CommentPermission.SET(table.DialogueSettings.NEW.CommentPermission),
				table.DialogueSettings.IssuePermission.SET(table.DialogueSettings.NEW.IssuePermission),
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

func (r *DiscussionRepository) CountByProjectID(ctx context.Context, workspaceID, projectID string) (int, error) {
	stmt := mysql.
		SELECT(mysql.COUNT(table.Discussions.ID).AS("Count")).
		FROM(table.Discussions).
		WHERE(
			table.Discussions.WorkspaceID.EQ(mysql.String(workspaceID)).
				AND(table.Discussions.ProjectID.EQ(mysql.String(projectID))),
		)

	var dest struct {
		Count int64
	}
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return 0, fmt.Errorf("failed to count discussions: %w", err)
	}
	return int(dest.Count), nil
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
		ID:          row.ID,
		WorkspaceID: row.WorkspaceID,
		ProjectID:   row.ProjectID,
		Content: domain.DiscussionContent{
			Theme:      row.Theme,
			Premise:    row.Premise,
			Conclusion: row.Conclusion,
			Language:   domain.DiscussionLanguage(row.Language),
		},
		Status: domain.DiscussionStatus(row.Status),
		Stats: domain.DiscussionStats{
			CommentsCount:         int(row.CommentsCount),
			ProposedCommentsCount: int(row.ProposedCommentsCount),
			IssuesCount:           int(row.IssuesCount),
		},
		Activity: domain.DiscussionActivity{
			CreatedBy: row.CreatedBy,
			CreatedAt: row.CreatedAt,
			ArchivedAt: func() time.Time {
				if row.ArchivedAt != nil {
					return *row.ArchivedAt
				}
				return time.Time{}
			}(),
			LastCommentedAt: row.LastCommentedAt,
		},
		DialogueSettings: dialogueSettings,
	})
}

func (r *DiscussionRepository) toDialogueSettingsDomain(row *model.DialogueSettings) (*domain.DialogueSettings, error) {
	var commentFrame domain.CommentFrame
	if err := json.Unmarshal([]byte(row.CommentFrame), &commentFrame); err != nil {
		return nil, fmt.Errorf("failed to unmarshal comment frame: %w", err)
	}

	return &domain.DialogueSettings{
		CommentFrame:      commentFrame,
		CommentPermission: domain.PermissionLevel(row.CommentPermission),
		IssuePermission:   domain.PermissionLevel(row.IssuePermission),
	}, nil
}

func (r *DiscussionRepository) toDiscussionModel(d *domain.Discussion) model.Discussions {
	m := model.Discussions{
		ID:                    d.ID(),
		WorkspaceID:           d.WorkspaceID(),
		ProjectID:             d.ProjectID(),
		Theme:                 d.Theme(),
		Premise:               d.Premise(),
		Conclusion:            d.Conclusion(),
		Language:              string(d.Language()),
		Status:                string(d.Status()),
		CommentsCount:         int32(d.CommentsCount()),
		ProposedCommentsCount: int32(d.ProposedCommentsCount()),
		IssuesCount:           int32(d.IssuesCount()),
		LastCommentedAt:       d.LastCommentedAt(),
		CreatedBy:             d.CreatedBy(),
		CreatedAt:             d.CreatedAt(),
	}
	if t, ok := d.ArchivedAt(); ok {
		m.ArchivedAt = &t
	}
	return m
}

func (r *DiscussionRepository) toDialogueSettingsModel(discussionID string, settings domain.DialogueSettings) (model.DialogueSettings, error) {
	commentFrameJSON, err := json.Marshal(settings.CommentFrame)
	if err != nil {
		return model.DialogueSettings{}, fmt.Errorf("failed to marshal comment frame: %w", err)
	}

	return model.DialogueSettings{
		DiscussionID:      discussionID,
		CommentFrame:      string(commentFrameJSON),
		CommentPermission: string(settings.CommentPermission),
		IssuePermission:   string(settings.IssuePermission),
	}, nil
}
