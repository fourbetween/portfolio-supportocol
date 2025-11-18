package api

import (
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/db"
	"github.com/fourbetween/app-supportocol/internal/model/project"
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

	projectFac := project.NewFactory(
		db.NewProjectRepository(tx),
		idSrv,
	)
	projectRepo := db.NewProjectRepository(tx)
	projectRepo.SetFactory(projectFac)

	userFac := user.NewFactory(workbookRepo, projectRepo, idSrv, clockSrv)
	return &Container{
		UserFac: userFac,
	}, nil
}
