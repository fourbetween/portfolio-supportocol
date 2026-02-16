package domain

import "github.com/fourbetween/app-supportocol/internal/pkg/apperr"

type DiscussionSort string

const (
	DiscussionSortLastCommentedAt DiscussionSort = "lastCommentedAt"
	DiscussionSortFavoritesCount  DiscussionSort = "favoritesCount"
)

func (s DiscussionSort) Validate() error {
	switch s {
	case DiscussionSortLastCommentedAt, DiscussionSortFavoritesCount:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}
