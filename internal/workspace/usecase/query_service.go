package usecase

import (
	"context"
	"time"
)

type WorkspaceWithMember struct {
	WorkspaceID        string
	WorkspaceSlug      string
	WorkspaceName      string
	WorkspaceType      string
	WorkspaceCreatedAt time.Time
	MemberRole         string
	MemberCreatedAt    time.Time
}

type WorkspaceAccessResult struct {
	CanAccess bool
	CanManage bool
}

type WorkspaceQueryService interface {
	ListMyWorkspaces(ctx context.Context, userID string) ([]WorkspaceWithMember, error)
	CanAccessWorkspace(ctx context.Context, userID string, workspaceID string) (bool, error)
	CheckWorkspaceAccess(ctx context.Context, userID string, workspaceID string) (WorkspaceAccessResult, error)
	CanAccessProject(ctx context.Context, userID string, workspaceID string, projectID string) (bool, error)
	IsPersonalWorkspace(ctx context.Context, workspaceID string) (bool, error)
}
