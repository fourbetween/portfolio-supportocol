package workbook

import "github.com/fourbetween/app-supportocol/internal/service/id"

type (
	Factory struct {
		repo  Repository
		idSrv id.Service
	}

	NewWorkbookParams struct {
		Title   string
		Status  Status
		OwnerID string
	}

	BuildWorkbookParams struct {
		ID string
		NewWorkbookParams
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

func (f *Factory) NewWorkbook(params NewWorkbookParams) *Workbook {
	id := f.idSrv.Generate()
	return f.BuildWorkbook(BuildWorkbookParams{
		ID:                id,
		NewWorkbookParams: params,
	})
}

func (f *Factory) BuildWorkbook(params BuildWorkbookParams) *Workbook {
	return &Workbook{
		id:      params.ID,
		title:   params.Title,
		status:  params.Status,
		ownerID: params.OwnerID,
		repo:    f.repo,
	}
}
