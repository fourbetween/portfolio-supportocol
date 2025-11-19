package rule

//go:generate go tool mockgen -package rule -destination ./repository_mock.go . Repository

type (
	Repository interface {
		Save(rule *Rule) error
		Load(params LoadParams) (*Rule, error)
		Search(params SearchParams) ([]*Rule, error)
		Delete(rule *Rule) error
	}

	LoadParams struct {
		ID        string
		CreatedBy string
	}

	SearchParams struct {
		CreatedBy string
	}
)
