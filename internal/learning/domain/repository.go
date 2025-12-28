package domain

import "context"

//go:generate go tool mockgen -package domain -destination ./repository_mock.go . Repository

type (
	LoadParams struct {
		ID        string
		CreatedBy string
	}

	Repository interface {
		Load(ctx context.Context, params LoadParams) (*Discussion, error)
		Save(ctx context.Context, discussion *Discussion) error
		Delete(ctx context.Context, discussion *Discussion) error
		SaveComment(ctx context.Context, comment *Comment) error
		DeleteComment(ctx context.Context, comment *Comment) error
	}
)
