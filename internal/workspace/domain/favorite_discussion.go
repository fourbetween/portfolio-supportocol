package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

const MaxFavoriteCount = 50

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
