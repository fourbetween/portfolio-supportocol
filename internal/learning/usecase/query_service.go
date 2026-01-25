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
	ArchivedAt      *time.Time
	LastCommentedAt time.Time
}

type ListDiscussionsParams struct {
	WorkspaceID string
	CreatedBy   string
	Archived    bool
}

type DiscussionQueryService interface {
	ListDiscussions(ctx context.Context, params ListDiscussionsParams) ([]DiscussionSummary, error)
}
