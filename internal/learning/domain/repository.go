package domain

import "context"

//go:generate go tool mockgen -package domain -destination ./repository_mock.go . DiscussionRepository,CommentRepository

type (
	LoadParams struct {
		ID        string
		CreatedBy string
	}

	DiscussionRepository interface {
		Load(ctx context.Context, params LoadParams) (*Discussion, error)
		List(ctx context.Context, createdBy string) ([]*Discussion, error)
		Save(ctx context.Context, discussion *Discussion) error
		Delete(ctx context.Context, discussion *Discussion) error
	}

	CommentRepository interface {
		LoadComment(ctx context.Context, id string) (*Comment, error)
		FetchComments(ctx context.Context, discussionID string) ([]*Comment, error)
		SaveComment(ctx context.Context, comment *Comment) error
		DeleteComment(ctx context.Context, comment *Comment) error
	}
)
