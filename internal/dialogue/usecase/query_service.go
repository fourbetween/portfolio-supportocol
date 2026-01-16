package usecase

import (
	"context"
	"time"
)

type DiscussionSummary struct {
	ID              string
	Theme           string
	LastCommentedAt time.Time
}

type DiscussionQueryService interface {
	ListDiscussions(ctx context.Context) ([]*DiscussionSummary, error)
}
