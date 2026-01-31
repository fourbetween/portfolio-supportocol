package domain

import (
	"time"

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
		ID:                     id,
		CreateDiscussionParams: params,
		LastCommentedAt:        now,
		CreatedAt:              now,
	})
}

type ReconstructDiscussionParams struct {
	ID string
	CreateDiscussionParams
	Conclusion       string
	CommentsCount    int
	LastCommentedAt  time.Time
	ArchivedAt       *time.Time
	CreatedAt        time.Time
	DialogueSettings *DialogueSettings
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	d := &Discussion{
		id:               params.ID,
		workspaceID:      params.WorkspaceID,
		projectID:        params.ProjectID,
		theme:            params.Theme,
		conclusion:       params.Conclusion,
		status:           params.Status,
		commentsCount:    params.CommentsCount,
		lastCommentedAt:  params.LastCommentedAt,
		archivedAt:       params.ArchivedAt,
		createdBy:        params.CreatedBy,
		createdAt:        params.CreatedAt,
		dialogueSettings: params.DialogueSettings,
	}

	if err := d.Validate(); err != nil {
		return nil, err
	}

	return d, nil
}
