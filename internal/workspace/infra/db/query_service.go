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

type workspaceWithMemberModel struct {
	model.Workspaces
	model.Members
}

func (s *workspaceQueryService) ListMyWorkspaces(ctx context.Context, userID string) ([]usecase.WorkspaceWithMember, error) {
	stmt := s.selectWorkspaceWithMember().
		WHERE(table.Members.UserID.EQ(mysql.String(userID))).
		ORDER_BY(table.Workspaces.Name.ASC())

	var dest []workspaceWithMemberModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to list my workspaces: %w", err)
	}

	res := make([]usecase.WorkspaceWithMember, len(dest))
	for i, d := range dest {
		res[i] = d.toUseCase()
	}

	return res, nil
}

func (s *workspaceQueryService) CanAccessWorkspace(ctx context.Context, userID string, workspaceID string) (bool, error) {
	w, err := s.loadMyWorkspaceByID(ctx, userID, workspaceID)
	if err != nil {
		return false, err
	}
	return w.WorkspaceID == workspaceID, nil
}

func (s *workspaceQueryService) loadMyWorkspaceByID(ctx context.Context, userID string, workspaceID string) (usecase.WorkspaceWithMember, error) {
	stmt := s.selectWorkspaceWithMember().
		WHERE(
			table.Workspaces.ID.EQ(mysql.String(workspaceID)).
				AND(table.Members.UserID.EQ(mysql.String(userID))),
		)

	var dest workspaceWithMemberModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return usecase.WorkspaceWithMember{}, fmt.Errorf("failed to load my workspace by ID: %w", err)
	}
	return dest.toUseCase(), nil
}

func (m workspaceWithMemberModel) toUseCase() usecase.WorkspaceWithMember {
	return usecase.WorkspaceWithMember{
		WorkspaceID:        m.Workspaces.ID,
		WorkspaceSlug:      m.Workspaces.Slug,
		WorkspaceName:      m.Workspaces.Name,
		WorkspaceType:      m.Workspaces.Type,
		WorkspaceCreatedAt: m.Workspaces.CreatedAt,
		MemberRole:         m.Members.Role,
		MemberCreatedAt:    m.Members.CreatedAt,
	}
}

func (s *workspaceQueryService) selectWorkspaceWithMember() mysql.SelectStatement {
	return mysql.
		SELECT(
			table.Workspaces.AllColumns,
			table.Members.AllColumns,
		).
		FROM(
			table.Workspaces.
				INNER_JOIN(table.Members, table.Workspaces.ID.EQ(table.Members.WorkspaceID)),
		)
}
