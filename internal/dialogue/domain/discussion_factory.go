package domain

import (
	"time"
)

type DiscussionFactory struct{}

func NewDiscussionFactory() *DiscussionFactory {
	return &DiscussionFactory{}
}

type ReconstructDiscussionParams struct {
	ID                    string
	WorkspaceID           string
	Theme                 string
	Premise               string
	Conclusion            string
	Status                DiscussionStatus
	Settings              DiscussionSettings
	CommentsCount         int
	ProposedCommentsCount int
	IssuesCount           int
	LastCommentedAt       time.Time
	ArchivedAt            *time.Time
	CreatedBy             string
	CreatedAt             time.Time
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	return &Discussion{
		id:                    params.ID,
		workspaceID:           params.WorkspaceID,
		theme:                 params.Theme,
		premise:               params.Premise,
		conclusion:            params.Conclusion,
		status:                params.Status,
		settings:              params.Settings,
		commentsCount:         params.CommentsCount,
		proposedCommentsCount: params.ProposedCommentsCount,
		issuesCount:           params.IssuesCount,
		lastCommentedAt:       params.LastCommentedAt,
		archivedAt:            params.ArchivedAt,
		createdBy:             params.CreatedBy,
		createdAt:             params.CreatedAt,
	}, nil
}
