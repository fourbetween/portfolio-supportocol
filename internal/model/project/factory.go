package project

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/service/clock"
	id "github.com/fourbetween/pkg-id"
)

type (
	Factory struct {
		repo     Repository
		idSrv    id.Service
		clockSrv clock.Service
	}

	NewProjectParams struct {
		Name      string
		CreatedBy string
	}

	BuildProjectParams struct {
		ID string
		NewProjectParams
		CreatedAt time.Time
	}
)

func NewFactory(
	repo Repository,
	idSrv id.Service,
	clockSrv clock.Service,
) *Factory {
	return &Factory{
		repo:     repo,
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

func (f *Factory) NewProject(params NewProjectParams) *Project {
	id := f.idSrv.Generate()
	return f.BuildProject(BuildProjectParams{
		ID:               id,
		NewProjectParams: params,
		CreatedAt:        f.clockSrv.Now(),
	})
}

func (f *Factory) BuildProject(params BuildProjectParams) *Project {
	return &Project{
		id:        params.ID,
		name:      params.Name,
		createdBy: params.CreatedBy,
		createdAt: params.CreatedAt,
		repo:      f.repo,
	}
}
