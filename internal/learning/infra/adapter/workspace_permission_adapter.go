package adapter

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
)

type WorkspacePermissionAdapter struct {
	qs usecase.WorkspaceQueryService
}

func NewWorkspacePermissionAdapter(qs usecase.WorkspaceQueryService) *WorkspacePermissionAdapter {
	return &WorkspacePermissionAdapter{qs: qs}
}

func (a *WorkspacePermissionAdapter) CheckWorkspaceAccess(ctx context.Context, userID, workspaceID string) (domain.WorkspaceAccess, error) {
	result, err := a.qs.CheckWorkspaceAccess(ctx, userID, workspaceID)
	if err != nil {
		return domain.WorkspaceAccess{}, err
	}
	return domain.WorkspaceAccess{
		CanAccess: result.CanAccess,
		CanManage: result.CanManage,
	}, nil
}

func (a *WorkspacePermissionAdapter) CanAccessProject(ctx context.Context, userID, workspaceID, projectID string) (bool, error) {
	return a.qs.CanAccessProject(ctx, userID, workspaceID, projectID)
}

func (a *WorkspacePermissionAdapter) IsPersonalWorkspace(ctx context.Context, workspaceID string) (bool, error) {
	return a.qs.IsPersonalWorkspace(ctx, workspaceID)
}
