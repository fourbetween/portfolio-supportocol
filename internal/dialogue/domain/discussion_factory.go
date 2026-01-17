package domain

import (
	"time"
)

type DiscussionFactory struct{}

func NewDiscussionFactory() *DiscussionFactory {
	return &DiscussionFactory{}
}

type ReconstructDiscussionParams struct {
	ID              string
	Theme           string
	Settings        DiscussionSettings
	CommentsCount   int
	LastCommentedAt *time.Time
	CreatedBy       string
	CreatedAt       time.Time
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	return &Discussion{
		id:              params.ID,
		theme:           params.Theme,
		settings:        params.Settings,
		commentsCount:   params.CommentsCount,
		lastCommentedAt: params.LastCommentedAt,
		createdBy:       params.CreatedBy,
		createdAt:       params.CreatedAt,
	}, nil
}
