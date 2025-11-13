package project

//go:generate go tool mockgen -package project -destination ./repository_mock.go . Repository

type (
	Repository interface {
		Save(project Project) error
		Load(params LoadParams) (Project, error)
		Search(params SearchParams) ([]Project, error)
	}

	LoadParams struct {
		ID        string
		CreatedBy string
	}

	SearchParams struct {
		CreatedBy string
	}
)
