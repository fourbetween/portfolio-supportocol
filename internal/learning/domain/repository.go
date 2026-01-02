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
		Load(ctx context.Context, id string) (*Comment, error)
		List(ctx context.Context, discussionID string) ([]*Comment, error)
		Save(ctx context.Context, comment *Comment) error
		Delete(ctx context.Context, comment *Comment) error
		PathToRoot(ctx context.Context, commentID string) ([]*Comment, error)
		Children(ctx context.Context, discussionID string, parentCommentID *string) ([]*Comment, error)
	}
)
