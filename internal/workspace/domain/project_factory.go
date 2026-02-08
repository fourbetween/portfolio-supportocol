package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type ProjectFactory struct {
	idSrv    id.Service
	clockSrv clock.Service
}

func NewProjectFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *ProjectFactory {
	return &ProjectFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

type CreateProjectParams struct {
	WorkspaceID string
	Name        string
	IsDefault   bool
}

func (f *ProjectFactory) Create(params CreateProjectParams) (*Project, error) {
	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	return f.Reconstruct(ReconstructProjectParams{
		ID:                  id,
		CreateProjectParams: params,
		CreatedAt:           now,
	})
}

type ReconstructProjectParams struct {
	ID string
	CreateProjectParams
	Premise   string
	CreatedAt time.Time
}

func (f *ProjectFactory) Reconstruct(params ReconstructProjectParams) (*Project, error) {
	p := &Project{
		id:          params.ID,
		workspaceID: params.WorkspaceID,
		name:        params.Name,
		premise:     params.Premise,
		isDefault:   params.IsDefault,
		createdAt:   params.CreatedAt,
	}

	if err := p.Validate(); err != nil {
		return nil, err
	}

	return p, nil
}
