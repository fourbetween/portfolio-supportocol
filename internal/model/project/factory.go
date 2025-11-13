package project

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/service/id"
)

type (
	Factory struct {
		repo  Repository
		idSrv id.Service
	}

	NewProjectParams struct {
		Name      string
		CreatedBy string
		CreatedAt time.Time
	}

	BuildProjectParams struct {
		ID string
		NewProjectParams
	}
)

func NewFactory(
	repo Repository,
	idSrv id.Service,
) *Factory {
	return &Factory{
		repo:  repo,
		idSrv: idSrv,
	}
}

func (f *Factory) NewProject(params NewProjectParams) Project {
	id := f.idSrv.Generate()
	return f.BuildProject(BuildProjectParams{
		ID:               id,
		NewProjectParams: params,
	})
}

func (f *Factory) BuildProject(params BuildProjectParams) Project {
	return Project{
		id:        params.ID,
		name:      params.Name,
		createdBy: params.CreatedBy,
		createdAt: params.CreatedAt,
		repo:      f.repo,
	}
}
