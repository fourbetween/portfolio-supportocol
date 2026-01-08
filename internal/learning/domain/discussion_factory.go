package domain

import (
	"time"

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
	Theme     string
	Status    DiscussionStatus
	CreatedBy string
}

func (f *DiscussionFactory) Create(params CreateDiscussionParams) (*Discussion, error) {
	id := f.idSrv.Generate()
	return f.Reconstruct(ReconstructDiscussionParams{
		ID:                     id,
		CreateDiscussionParams: params,
		CreatedAt:              f.clockSrv.Now(),
	})
}

type ReconstructDiscussionParams struct {
	ID string
	CreateDiscussionParams
	CreatedAt time.Time
}

func (f *DiscussionFactory) Reconstruct(params ReconstructDiscussionParams) (*Discussion, error) {
	return &Discussion{
		id:        params.ID,
		theme:     params.Theme,
		status:    params.Status,
		createdBy: params.CreatedBy,
		createdAt: params.CreatedAt,
	}, nil
}
