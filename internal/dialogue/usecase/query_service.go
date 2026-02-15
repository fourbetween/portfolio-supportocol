package usecase

import (
	"context"
	"time"
)

type DiscussionSummary struct {
	ID              string
	WorkspaceID     string
	Theme           string
	Status          string
	ArchivedAt      *time.Time
	LastCommentedAt time.Time
	CommentsCount   int
	FavoritesCount  int
}

type DiscussionQueryService interface {
	// ListPublicDiscussions lists all public discussions (accessible by everyone).
	ListPublicDiscussions(ctx context.Context) ([]DiscussionSummary, error)
	// ListInternalDiscussions lists internal discussions for a specific workspace (accessible by members).
	ListInternalDiscussions(ctx context.Context, workspaceID string) ([]DiscussionSummary, error)
}
