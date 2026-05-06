package usecase

import (
	"context"
	"time"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
)

type DiscussionSummary struct {
	ID              string
	WorkspaceID     string
	Theme           string
	Language        string
	Status          string
	ArchivedAt      *time.Time
	LastCommentedAt time.Time
	CommentsCount   int
	FavoritesCount  int
}

type DiscussionListResult struct {
	Items      []DiscussionSummary
	TotalCount int
}

type ReadCachePolicy struct {
	Cacheable bool
}

type DiscussionQueryService interface {
	// ListPublicDiscussions lists all public discussions (accessible by everyone).
	// language is optional; if empty, all languages are returned.
	ListPublicDiscussions(
		ctx context.Context,
		language string,
		sort domain.DiscussionSort,
		paging domain.Paging,
	) (DiscussionListResult, error)

	// ListInternalDiscussions lists internal discussions for a specific workspace (accessible by members).
	ListInternalDiscussions(
		ctx context.Context,
		workspaceID string,
		sort domain.DiscussionSort,
		paging domain.Paging,
	) (DiscussionListResult, error)
}
