package adapter

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
)

type WorkspacePermissionAdapter struct {
	qs usecase.WorkspaceQueryService
}

func NewWorkspacePermissionAdapter(qs usecase.WorkspaceQueryService) *WorkspacePermissionAdapter {
	return &WorkspacePermissionAdapter{qs: qs}
}

func (a *WorkspacePermissionAdapter) CanAccessWorkspace(ctx context.Context, userID, workspaceID string) (bool, error) {
	return a.qs.CanAccessWorkspace(ctx, userID, workspaceID)
}

func (a *WorkspacePermissionAdapter) CanAccessProject(ctx context.Context, userID, workspaceID, projectID string) (bool, error) {
	return a.qs.CanAccessProject(ctx, userID, workspaceID, projectID)
}

func (a *WorkspacePermissionAdapter) IsPersonalWorkspace(ctx context.Context, workspaceID string) (bool, error) {
	return a.qs.IsPersonalWorkspace(ctx, workspaceID)
}
