package domain

import (
	"context"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type (
	CommentRepository interface {
		Load(ctx context.Context, id string) (*Comment, error)
		Search(ctx context.Context, params SearchCommentsParams) ([]*Comment, error)
		Create(ctx context.Context, comment *Comment) error
		Update(ctx context.Context, comment *Comment) error
		GetPathToRoot(ctx context.Context, id string) ([]*Comment, error)
	}

	SearchCommentsParams struct {
		DiscussionID string
		Since        time.Time
	}
)

type (
	CommentFactory struct {
		idSrv    id.Service
		clockSrv clock.Service
	}

	CreateCommentParams struct {
		DiscussionID    string
		ParentCommentID string
		Body            CommentBody
		Status          CommentStatus
		CreatedBy       string
		Issues          []CommentIssue
	}

	ReconstructCommentParams struct {
		ID              string
		DiscussionID    string
		ParentCommentID string
		Body            CommentBody
		Status          CommentStatus
		Activity        CommentActivity
		Issues          []CommentIssue
	}
)

func NewCommentFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *CommentFactory {
	return &CommentFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

func (f *CommentFactory) Create(params CreateCommentParams) (*Comment, error) {
	id := f.idSrv.Generate()
	return f.Reconstruct(ReconstructCommentParams{
		ID:              id,
		DiscussionID:    params.DiscussionID,
		ParentCommentID: params.ParentCommentID,
		Body:            params.Body,
		Status:          params.Status,
		Activity: CommentActivity{
			CreatedBy: params.CreatedBy,
			CreatedAt: f.clockSrv.Now(),
		},
		Issues: params.Issues,
	})
}

func (f *CommentFactory) Reconstruct(params ReconstructCommentParams) (*Comment, error) {
	c := &Comment{
		id:              params.ID,
		discussionID:    params.DiscussionID,
		parentCommentID: params.ParentCommentID,
		body:            params.Body,
		status:          params.Status,
		activity:        params.Activity,
		issues:          params.Issues,
	}

	if err := c.Validate(); err != nil {
		return nil, err
	}

	return c, nil
}

type Comment struct {
	id              string
	discussionID    string
	parentCommentID string
	body            CommentBody
	status          CommentStatus
	activity        CommentActivity
	issues          []CommentIssue
}

func (c *Comment) ID() string {
	return c.id
}

func (c *Comment) DiscussionID() string {
	return c.discussionID
}

func (c *Comment) ParentCommentID() (string, bool) {
	if c.parentCommentID == "" {
		return "", false
	}
	return c.parentCommentID, true
}

func (c *Comment) Type() string {
	return c.body.Type
}

func (c *Comment) Content() string {
	return c.body.Content
}

func (c *Comment) Status() CommentStatus {
	return c.status
}

func (c *Comment) ArchivedAt() (time.Time, bool) {
	if c.activity.ArchivedAt.IsZero() {
		return time.Time{}, false
	}
	return c.activity.ArchivedAt, true
}

func (c *Comment) IsArchived() bool {
	return !c.activity.ArchivedAt.IsZero()
}

func (c *Comment) CreatedBy() (string, bool) {
	if c.activity.CreatedBy == "" {
		return "", false
	}
	return c.activity.CreatedBy, true
}

func (c *Comment) CreatedAt() time.Time {
	return c.activity.CreatedAt
}

func (c *Comment) Issues() []CommentIssue {
	return c.issues
}

type UpdateCommentParams struct {
	CommentType string
	Content     string
}

func (c *Comment) Update(params UpdateCommentParams) error {
	c.body.Type = params.CommentType
	c.body.Content = params.Content
	return nil
}

func (c *Comment) UpdateStatus(status CommentStatus) error {
	if err := status.Validate(); err != nil {
		return err
	}
	if c.status == CommentStatusActive && status == CommentStatusProposed {
		return apperr.ErrInvalidArgument
	}
	c.status = status
	return nil
}

func (c *Comment) Validate() error {
	if err := c.status.Validate(); err != nil {
		return err
	}
	return nil
}

func (c *Comment) CanAddChild() error {
	if c.IsArchived() {
		return apperr.ErrPermissionDenied
	}
	return nil
}

func (c *Comment) AddIssue(issue CommentIssue) {
	c.issues = append(c.issues, issue)
}

func (c *Comment) CheckBelongsTo(discussionID string) error {
	if c.discussionID != discussionID {
		return apperr.ErrInvalidArgument
	}
	return nil
}

type CommentBody struct {
	Type    string
	Content string
}

type CommentActivity struct {
	CreatedBy  string
	CreatedAt  time.Time
	ArchivedAt time.Time
}

type CommentStatus string

const (
	CommentStatusActive   CommentStatus = "active"
	CommentStatusProposed CommentStatus = "proposed"
)

func (s CommentStatus) Validate() error {
	switch s {
	case CommentStatusActive, CommentStatusProposed:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}

type CommentIssue struct {
	ID          string
	Title       string
	Description string
	CreatedBy   string
}
