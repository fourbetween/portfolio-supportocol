package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

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
		WHERE(
			cond.AND(
				table.Discussions.Status.IN(mysql.String("public"), mysql.String("internal")),
			),
		).
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

func (r *DiscussionRepository) toDomain(row discussionWithSettings) (*domain.Discussion, error) {
	settings, err := r.toDialogueSettingsDomain(row.DialogueSettings)
	if err != nil {
		return nil, err
	}

	return r.fac.Reconstruct(domain.ReconstructDiscussionParams{
		ID:          row.ID,
		WorkspaceID: row.WorkspaceID,
		Content: domain.DiscussionContent{
			Theme:      row.Theme,
			Premise:    row.Premise,
			Conclusion: row.Conclusion,
		},
		Status:   domain.DiscussionStatus(row.Status),
		Settings: settings,
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
	})
}

func (r *DiscussionRepository) Save(ctx context.Context, d *domain.Discussion) error {
	stmt := table.Discussions.
		UPDATE(
			table.Discussions.CommentsCount,
			table.Discussions.ProposedCommentsCount,
			table.Discussions.IssuesCount,
			table.Discussions.LastCommentedAt,
		).
		SET(
			mysql.Int(int64(d.CommentsCount())),
			mysql.Int(int64(d.ProposedCommentsCount())),
			mysql.Int(int64(d.IssuesCount())),
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
		CommentFrame:      commentFrame,
		CommentPermission: domain.PermissionLevel(row.CommentPermission),
		IssuePermission:   domain.PermissionLevel(row.IssuePermission),
	}, nil
}
