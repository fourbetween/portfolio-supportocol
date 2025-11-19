package user

import (
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
)

type (
	Factory struct {
		workbookRepo workbook.Repository
		projectRepo  project.Repository
		ruleRepo     rule.Repository
		projectFac   *project.Factory
		ruleFac      *rule.Factory
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
	ruleRepo rule.Repository,
	projectFac *project.Factory,
	ruleFac *rule.Factory,
	clockSrv clock.Service,
) *Factory {
	return &Factory{
		workbookRepo: workbookRepo,
		projectRepo:  projectRepo,
		ruleRepo:     ruleRepo,
		projectFac:   projectFac,
		ruleFac:      ruleFac,
		clockSrv:     clockSrv,
	}
}

func (f *Factory) Build(params BuildParams) *User {
	return &User{
		id:    params.ID,
		email: params.Email,

		workbookRepo: f.workbookRepo,
		projectRepo:  f.projectRepo,
		ruleRepo:     f.ruleRepo,
		projectFac:   f.projectFac,
		ruleFac:      f.ruleFac,
		clockSrv:     f.clockSrv,
	}
}
