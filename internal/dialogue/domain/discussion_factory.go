package domain

import (
	"time"
)

type DiscussionFactory struct{}

func NewDiscussionFactory() *DiscussionFactory {
	return &DiscussionFactory{}
}

type ReconstructDiscussionParams struct {
	ID        string
	Theme     string
	Settings  DiscussionSettings
	CreatedBy string
	CreatedAt time.Time
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	return &Discussion{
		id:        params.ID,
		theme:     params.Theme,
		settings:  params.Settings,
		createdBy: params.CreatedBy,
		createdAt: params.CreatedAt,
	}, nil
}
