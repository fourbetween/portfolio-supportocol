package usecase

import (
	"context"
	"time"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type DiscussionSummary struct {
	ID              string
	Theme           string
	Status          domain.DiscussionStatus
	LastCommentedAt time.Time
}

type DiscussionQueryService interface {
	ListDiscussions(ctx context.Context, createdBy string) ([]*DiscussionSummary, error)
}
