package workbook

//go:generate go tool mockgen -package workbook -destination ./repository_mock.go . Repository

type (
	Repository interface {
		Save(workbook *Workbook) error
		Load(params LoadParams) (*Workbook, error)
		Search(params SearchParams) ([]*Workbook, error)
	}

	LoadParams struct {
		ID      string
		OwnerID string
	}

	SearchParams struct {
		OwnerID string
	}
)
