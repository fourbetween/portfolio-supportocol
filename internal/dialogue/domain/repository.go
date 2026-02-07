package domain

import (
	"context"
	"time"
)

type (
	DiscussionRepository interface {
		Load(ctx context.Context, params LoadDiscussionParams) (*Discussion, error)
		Save(ctx context.Context, discussion *Discussion) error
	}

	LoadDiscussionParams struct {
		ID          string
		WorkspaceID string
	}

	CommentRepository interface {
		Load(ctx context.Context, id string) (*Comment, error)
		Search(ctx context.Context, params SearchCommentsParams) ([]*Comment, error)
		Create(ctx context.Context, comment *Comment) error
		Update(ctx context.Context, comment *Comment) error
		GetPathToRoot(ctx context.Context, id string) ([]*Comment, error)
	}

	SearchCommentsParams struct {
		DiscussionID string
		Since        *time.Time
	}
)
