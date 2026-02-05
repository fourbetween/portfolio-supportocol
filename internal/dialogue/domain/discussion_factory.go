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
	WorkspaceID     string
	Theme           string
	Conclusion      string
	Settings        DiscussionSettings
	CommentsCount   int
	LastCommentedAt time.Time
	ArchivedAt      *time.Time
	CreatedBy       string
	CreatedAt       time.Time
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	return &Discussion{
		id:              params.ID,
		workspaceID:     params.WorkspaceID,
		theme:           params.Theme,
		conclusion:      params.Conclusion,
		settings:        params.Settings,
		commentsCount:   params.CommentsCount,
		lastCommentedAt: params.LastCommentedAt,
		archivedAt:      params.ArchivedAt,
		createdBy:       params.CreatedBy,
		createdAt:       params.CreatedAt,
	}, nil
}
