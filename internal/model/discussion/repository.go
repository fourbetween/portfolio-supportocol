package discussion

//go:generate mockgen -source=$GOFILE -destination=repository_mock.go -package=$GOPACKAGE

type (
	SearchParams struct {
		ProjectID string
	}

	Repository interface {
		Search(params SearchParams) ([]*Discussion, error)
	}
)
