package domain

import (
	"context"
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type (
	FavoriteDiscussionRepository interface {
		Save(ctx context.Context, fav FavoriteDiscussion) error
		Delete(ctx context.Context, memberID, discussionID string) error
		CountByMemberID(ctx context.Context, memberID string) (int, error)
	}

	DiscussionFavoritesService interface {
		IncrementFavoritesCount(ctx context.Context, discussionID string) error
		DecrementFavoritesCount(ctx context.Context, discussionID string) error
	}
)

const MaxFavoriteCount = 100

type FavoriteDiscussion struct {
	MemberID     string
	DiscussionID string
	CreatedAt    time.Time
}

func (f FavoriteDiscussion) Validate() error {
	if f.MemberID == "" {
		return fmt.Errorf("member id is required: %w", apperr.ErrInvalidArgument)
	}
	if f.DiscussionID == "" {
		return fmt.Errorf("discussion id is required: %w", apperr.ErrInvalidArgument)
	}
	return nil
}
