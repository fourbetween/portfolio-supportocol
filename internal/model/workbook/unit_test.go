package workbook_test

import (
	"testing"

	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/id"
	"go.uber.org/mock/gomock"
)

type (
	container struct {
		WorkbookFac  *workbook.Factory
		WorkbookRepo workbook.Repository
	}
)

func newContainer(t *testing.T) *container {
	ctrl := gomock.NewController(t)

	idSrv := id.NewULIDService()
	workbookRepo := workbook.NewMockRepository(ctrl)
	workbookFac := workbook.NewFactory(
		workbookRepo,
		idSrv,
	)
	return &container{
		WorkbookFac:  workbookFac,
		WorkbookRepo: workbookRepo,
	}
}
