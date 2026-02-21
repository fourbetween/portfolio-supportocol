package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type WorkspaceFactory struct {
	idSrv    id.Service
	clockSrv clock.Service
}

func NewWorkspaceFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *WorkspaceFactory {
	return &WorkspaceFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

type CreateWorkspaceParams struct {
	Slug string
	Name string
	Type WorkspaceType
	Plan Plan
}

func (f *WorkspaceFactory) Create(params CreateWorkspaceParams) (*Workspace, error) {
	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	periodEnd := now.AddDate(0, 1, 0)
	return f.Reconstruct(ReconstructWorkspaceParams{
		ID:   id,
		Slug: params.Slug,
		Name: params.Name,
		Type: params.Type,
		Subscription: Subscription{
			Plan:               params.Plan,
			Status:             SubscriptionStatusActive,
			CurrentPeriodStart: now,
			CurrentPeriodEnd:   periodEnd,
		},
		CreatedAt: now,
	})
}

type ReconstructWorkspaceParams struct {
	ID           string
	Slug         string
	Name         string
	Type         WorkspaceType
	Subscription Subscription
	CreatedAt    time.Time
}

func (f *WorkspaceFactory) Reconstruct(params ReconstructWorkspaceParams) (*Workspace, error) {
	w := &Workspace{
		id:           params.ID,
		slug:         params.Slug,
		name:         params.Name,
		wsType:       params.Type,
		subscription: params.Subscription,
		createdAt:    params.CreatedAt,
	}

	if err := w.Validate(); err != nil {
		return nil, err
	}

	return w, nil
}
