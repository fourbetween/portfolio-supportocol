package domain

import (
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type DiscussionFactory struct {
	idSrv    id.Service
	clockSrv clock.Service
}

func NewDiscussionFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *DiscussionFactory {
	return &DiscussionFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

type CreateDiscussionParams struct {
	WorkspaceID string
	ProjectID   string
	Theme       string
	Premise     string
	Status      DiscussionStatus
	CreatedBy   string
}

func (f *DiscussionFactory) Create(params CreateDiscussionParams, count int) (*Discussion, error) {
	if count >= MaxDiscussionsPerProject {
		return nil, apperr.ErrLimitExceeded
	}

	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	return f.Reconstruct(ReconstructDiscussionParams{
		ID:          id,
		WorkspaceID: params.WorkspaceID,
		ProjectID:   params.ProjectID,
		Content: DiscussionContent{
			Theme:   params.Theme,
			Premise: params.Premise,
		},
		Status: params.Status,
		Activity: DiscussionActivity{
			CreatedBy:       params.CreatedBy,
			CreatedAt:       now,
			LastCommentedAt: now,
		},
	})
}

type ReconstructDiscussionParams struct {
	ID               string
	WorkspaceID      string
	ProjectID        string
	Content          DiscussionContent
	Status           DiscussionStatus
	Stats            DiscussionStats
	Activity         DiscussionActivity
	DialogueSettings *DialogueSettings
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	d := &Discussion{
		id:               params.ID,
		workspaceID:      params.WorkspaceID,
		projectID:        params.ProjectID,
		content:          params.Content,
		status:           params.Status,
		stats:            params.Stats,
		activity:         params.Activity,
		dialogueSettings: params.DialogueSettings,
	}

	if err := d.Validate(); err != nil {
		return nil, err
	}

	return d, nil
}
