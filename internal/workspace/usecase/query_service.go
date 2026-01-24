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

type WorkspaceQueryService interface {
	ListMyWorkspaces(ctx context.Context, userID string) ([]*WorkspaceWithMember, error)
}
