package discussion

//go:generate mockgen -source=$GOFILE -destination=repository_mock.go -package=$GOPACKAGE

type (
	SearchParams struct {
		ProjectID string
	}

	LoadParams struct {
		ID string
	}

	Repository interface {
		Search(params SearchParams) ([]*Discussion, error)
		Load(params LoadParams) (*Discussion, error)
		Save(discussion *Discussion) error
		Delete(discussion *Discussion) error
		FetchComments(discussionID string) ([]Comment, error)
		FetchIssues(discussionID string) ([]Issue, error)
		FetchNotes(discussionID string) ([]Note, error)
	}
)
