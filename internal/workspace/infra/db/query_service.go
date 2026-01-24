package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
	"github.com/go-jet/jet/v2/mysql"
)

// workspaceQueryService is implementation of usecase.WorkspaceQueryService.
type workspaceQueryService struct {
	db *sql.DB
}

func NewWorkspaceQueryService(db *sql.DB) usecase.WorkspaceQueryService {
	return &workspaceQueryService{db: db}
}

func (s *workspaceQueryService) ListMyWorkspaces(ctx context.Context, userID string) ([]*usecase.WorkspaceWithMember, error) {
	stmt := mysql.
		SELECT(
			table.Workspaces.AllColumns,
			table.Members.AllColumns,
		).
		FROM(
			table.Workspaces.
				INNER_JOIN(table.Members, table.Workspaces.ID.EQ(table.Members.WorkspaceID)),
		).
		WHERE(table.Members.UserID.EQ(mysql.String(userID))).
		ORDER_BY(table.Workspaces.Name.ASC())

	var dest []struct {
		model.Workspaces
		model.Members
	}

	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to list my workspaces: %w", err)
	}

	res := make([]*usecase.WorkspaceWithMember, len(dest))
	for i, d := range dest {
		res[i] = &usecase.WorkspaceWithMember{
			WorkspaceID:        d.Workspaces.ID,
			WorkspaceSlug:      d.Workspaces.Slug,
			WorkspaceName:      d.Workspaces.Name,
			WorkspaceType:      d.Workspaces.Type,
			WorkspaceCreatedAt: d.Workspaces.CreatedAt,
			MemberRole:         d.Members.Role,
			MemberCreatedAt:    d.Members.CreatedAt,
		}
	}

	return res, nil
}
