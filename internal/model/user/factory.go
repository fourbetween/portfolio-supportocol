package user

import (
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
	"github.com/fourbetween/app-supportocol/internal/service/id"
)

type (
	Factory struct {
		workbookRepo workbook.Repository
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
	idSrv id.Service,
	clockSrv clock.Service,
) *Factory {
	projectFac := project.NewFactory(projectRepo, idSrv)
	return &Factory{
		workbookRepo: workbookRepo,
		projectFac:   projectFac,
		clockSrv:     clockSrv,
	}
}

func (f *Factory) Build(params BuildParams) *User {
	return &User{
		id:    params.ID,
		email: params.Email,

		workbookRepo: f.workbookRepo,
		projectFac:   f.projectFac,
		clockSrv:     f.clockSrv,
	}
}
