package usecase

import (
	"context"
	"time"
)

type DiscussionSummary struct {
	ID              string
	WorkspaceID     string
	Theme           string
	ArchivedAt      *time.Time
	LastCommentedAt time.Time
}

type DiscussionQueryService interface {
	ListDiscussions(ctx context.Context) ([]DiscussionSummary, error)
}
