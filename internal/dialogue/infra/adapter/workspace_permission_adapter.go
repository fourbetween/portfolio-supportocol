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

func (a *WorkspacePermissionAdapter) CanAccessWorkspace(ctx context.Context, workspaceID string) (bool, error) {
	return a.qs.IsPersonalWorkspace(ctx, workspaceID)
}
