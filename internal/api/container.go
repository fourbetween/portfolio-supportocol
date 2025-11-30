package api

import (
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/db"
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
	"github.com/fourbetween/app-supportocol/internal/service/id"
)

type (
	Container struct {
		UserFac *user.Factory
	}
)

func NewContainer(tx *sql.Tx) (*Container, error) {
	idSrv := id.NewULIDService()
	clockSrv := clock.NewRealService()
	workbookRepo := db.NewWorkbookRepository(tx)
	workbookFac := workbook.NewFactory(
		workbookRepo,
		idSrv,
	)
	workbookRepo.SetFactory(workbookFac)

	projectRepo := db.NewProjectRepository(tx)
	projectFac := project.NewFactory(
		projectRepo,
		idSrv,
	)
	projectRepo.SetFactory(projectFac)

	ruleRepo := db.NewRuleRepository(tx)
	ruleFac := rule.NewFactory(
		ruleRepo,
		idSrv,
	)
	ruleRepo.SetFactory(ruleFac)

	discussionRepo := db.NewDiscussionRepository(tx)
	discussionFac := discussion.NewFactory(
		discussionRepo,
		idSrv,
		clockSrv,
		ruleRepo,
	)
	discussionRepo.SetFactory(discussionFac)

	userFac := user.NewFactory(
		workbookRepo,
		projectRepo,
		ruleRepo,
		discussionRepo,
		projectFac,
		ruleFac,
		discussionFac,
		clockSrv,
	)
	return &Container{
		UserFac: userFac,
	}, nil
}
