package domain

import "context"

type WorkspaceAccess struct {
	CanAccess bool
	CanManage bool
}

type PermissionService interface {
	CheckWorkspaceAccess(ctx context.Context, userID, workspaceID string) (WorkspaceAccess, error)
	CanAccessProject(ctx context.Context, userID, workspaceID, projectID string) (bool, error)
	IsPersonalWorkspace(ctx context.Context, workspaceID string) (bool, error)
}
