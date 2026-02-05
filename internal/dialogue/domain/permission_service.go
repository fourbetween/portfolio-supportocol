package domain

import "context"

type PermissionService interface {
	CanAccessWorkspace(ctx context.Context, workspaceID string) (bool, error)
}
