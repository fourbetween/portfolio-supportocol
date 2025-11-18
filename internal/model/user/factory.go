package user

import (
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
)

type (
	Factory struct {
		workbookRepo workbook.Repository
		projectRepo  project.Repository
		projectFac   *project.Factory
		clockSrv     clock.Service
	}

	BuildParams struct {
		ID    string
		Email string
	}
)

func NewFactory(
	workbookRepo workbook.Repository,
	projectRepo project.Repository,
	projectFac *project.Factory,
	clockSrv clock.Service,
) *Factory {
	return &Factory{
		workbookRepo: workbookRepo,
		projectRepo:  projectRepo,
		projectFac:   projectFac,
		clockSrv:     clockSrv,
	}
}

func (f *Factory) Build(params BuildParams) *User {
	return &User{
		id:    params.ID,
		email: params.Email,

		workbookRepo: f.workbookRepo,
		projectRepo:  f.projectRepo,
		projectFac:   f.projectFac,
		clockSrv:     f.clockSrv,
	}
}
