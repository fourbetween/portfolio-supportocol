package domain

import "context"

type PermissionService interface {
	CanAccessWorkspace(ctx context.Context, userID, workspaceID string) (bool, error)
}
