package domain

import (
	"context"
	"time"
)

//go:generate go tool mockgen -package domain -destination ./repository_mock.go . DiscussionRepository,CommentRepository,IssueRepository

type (
	DiscussionRepository interface {
		Load(ctx context.Context, params LoadDiscussionParams) (*Discussion, error)
		Save(ctx context.Context, discussion *Discussion) error
		Delete(ctx context.Context, discussion *Discussion) error
		CountByProjectID(ctx context.Context, workspaceID, projectID string) (int, error)
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
		BatchCreate(ctx context.Context, comments []*Comment) error
		Delete(ctx context.Context, comment *Comment) error
		GetPathToRoot(ctx context.Context, commentID string) ([]*Comment, error)
		ListChildren(ctx context.Context, params ListCommentChildrenParams) ([]*Comment, error)
		CountByDiscussionID(ctx context.Context, discussionID string) (int, error)
	}

	SearchCommentsParams struct {
		DiscussionID string
		Since        *time.Time
	}

	ListCommentChildrenParams struct {
		DiscussionID    string
		ParentCommentID *string
		CommentType     string
	}

	IssueRepository interface {
		Load(ctx context.Context, id string) (*Issue, error)
		Save(ctx context.Context, issue *Issue) error
		List(ctx context.Context) ([]*Issue, error)
		Delete(ctx context.Context, issue *Issue) error
	}
)
