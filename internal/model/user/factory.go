package user

import "github.com/fourbetween/app-supportocol/internal/model/workbook"

type (
	Factory struct {
		workbookRepo workbook.Repository
	}

	BuildParams struct {
		ID    string
		Email string
	}
)

func NewFactory(
	workbookRepo workbook.Repository,
) *Factory {
	return &Factory{
		workbookRepo: workbookRepo,
	}
}

func (f *Factory) Build(params BuildParams) User {
	return User{
		id:    params.ID,
		email: params.Email,

		workbookRepo: f.workbookRepo,
	}
}
