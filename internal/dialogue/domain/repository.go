package domain

import (
	"context"
	"time"
)

//go:generate go tool mockgen -package domain -destination ./repository_mock.go . DiscussionRepository,CommentRepository

type (
	DiscussionRepository interface {
		Load(ctx context.Context, params LoadDiscussionParams) (*Discussion, error)
		Search(ctx context.Context) ([]*Discussion, error)
	}

	LoadDiscussionParams struct {
		ID string
	}

	CommentRepository interface {
		Load(ctx context.Context, id string) (*Comment, error)
		Search(ctx context.Context, params SearchCommentsParams) ([]*Comment, error)
		Save(ctx context.Context, comment *Comment) error
	}

	SearchCommentsParams struct {
		DiscussionID string
		Since        *time.Time
	}
)
