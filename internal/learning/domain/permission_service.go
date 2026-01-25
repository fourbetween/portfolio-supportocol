package domain

import "context"

type PermissionService interface {
	CanAccessWorkspace(ctx context.Context, userID, workspaceID string) (bool, error)
	CanAccessProject(ctx context.Context, userID, workspaceID, projectID string) (bool, error)
}
