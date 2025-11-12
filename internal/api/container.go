package api

import (
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/db"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/id"
)

type (
	Container struct {
		UserFac *user.Factory
	}
)

func NewContainer(tx *sql.Tx) (*Container, error) {
	idSrv := id.NewULIDService()
	workbookRepo := db.NewWorkbookRepository(tx)
	workbookFac := workbook.NewFactory(
		workbookRepo,
		idSrv,
	)
	workbookRepo.SetFactory(workbookFac)
	userFac := user.NewFactory(workbookRepo)
	return &Container{
		UserFac: userFac,
	}, nil
}
