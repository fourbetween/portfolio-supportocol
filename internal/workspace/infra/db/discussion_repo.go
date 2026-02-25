package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/table"
	"github.com/go-jet/jet/v2/mysql"
)

type DiscussionRepository struct {
	db *sql.DB
}

func NewDiscussionRepository(db *sql.DB) *DiscussionRepository {
	return &DiscussionRepository{db: db}
}

func (r *DiscussionRepository) MoveToProject(ctx context.Context, params domain.MoveDiscussionsParams) error {
	ids := make([]mysql.Expression, len(params.DiscussionIDs))
	for i, id := range params.DiscussionIDs {
		ids[i] = mysql.String(id)
	}

	stmt := table.Discussions.
		UPDATE(table.Discussions.ProjectID).
		SET(params.ToProjectID).
		WHERE(
			table.Discussions.ID.IN(ids...).
				AND(table.Discussions.WorkspaceID.EQ(mysql.String(params.WorkspaceID))),
		)

	result, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db))
	if err != nil {
		return fmt.Errorf("failed to move discussions to project: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if int(affected) != len(params.DiscussionIDs) {
		return fmt.Errorf("expected to move %d discussions but moved %d: %w",
			len(params.DiscussionIDs), affected, fmt.Errorf("some discussions were not found"))
	}

	return nil
}
