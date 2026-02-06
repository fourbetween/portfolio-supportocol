package adapter

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
)

type WorkspacePermissionAdapter struct {
	qs usecase.WorkspaceQueryService
}

func NewWorkspacePermissionAdapter(qs usecase.WorkspaceQueryService) *WorkspacePermissionAdapter {
	return &WorkspacePermissionAdapter{qs: qs}
}

func (a *WorkspacePermissionAdapter) CanAccessDiscussion(ctx context.Context, userID string, workspaceID string, status domain.DiscussionStatus) (bool, error) {
	switch status {
	case domain.DiscussionStatusPublic:
		// Public discussions in personal workspaces are accessible to everyone
		return a.qs.IsPersonalWorkspace(ctx, workspaceID)
	case domain.DiscussionStatusInternal:
		// Internal discussions require the user to be a member of the org workspace
		if userID == "" {
			return false, nil
		}
		return a.qs.CanAccessWorkspace(ctx, userID, workspaceID)
	default:
		return false, nil
	}
}
