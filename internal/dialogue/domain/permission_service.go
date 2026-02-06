package domain

import "context"

type PermissionService interface {
	// CanAccessDiscussion checks if the user can access a discussion based on its status.
	// For public discussions (personal workspace), anyone can access.
	// For internal discussions (org workspace), only workspace members can access.
	// userID may be empty for unauthenticated users.
	CanAccessDiscussion(ctx context.Context, userID string, workspaceID string, status DiscussionStatus) (bool, error)
}
