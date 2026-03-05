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
		BatchCreate(ctx context.Context, comments []*Comment) error
		Delete(ctx context.Context, comment *Comment) error
		DeleteByDiscussionID(ctx context.Context, discussionID string) error
		GetPathToRoot(ctx context.Context, commentID string) ([]*Comment, error)
		ListChildren(ctx context.Context, params ListCommentChildrenParams) ([]*Comment, error)
		CountsByDiscussionID(ctx context.Context, discussionID string) (DiscussionCounts, error)
		RenameCommentType(ctx context.Context, discussionID, oldType, newType string) error
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
)

type CommentGenerationQueue interface {
	Enqueue(params []GenerateCommentParams) error
}

type GenerateCommentParams struct {
	DiscussionID    string
	WorkspaceID     string
	ParentCommentID *string
	CommentType     string
	UserID          string
}

type CommentGenerator interface {
	Generate(ctx context.Context, params GenerateCommentParams) ([]*Comment, error)
}

type ProjectPremiseProvider interface {
	GetProjectPremise(ctx context.Context, workspaceID, projectID string) (string, error)
}

type (
	CommentFactory struct {
		idSrv    id.Service
		clockSrv clock.Service
	}

	CreateCommentParams struct {
		DiscussionID    string
		ParentCommentID *string
		Body            CommentBody
		Status          CommentStatus
		CreatedBy       *string
		Issues          []CommentIssue
	}

	ReconstructCommentParams struct {
		ID              string
		DiscussionID    string
		ParentCommentID *string
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
	parentCommentID *string
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

func (c *Comment) ParentCommentID() *string {
	return c.parentCommentID
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

func (c *Comment) CreatedBy() *string {
	return c.activity.CreatedBy
}

func (c *Comment) CreatedAt() time.Time {
	return c.activity.CreatedAt
}

func (c *Comment) Issues() []CommentIssue {
	return c.issues
}

func (c *Comment) ArchivedAt() *time.Time {
	return c.activity.ArchivedAt
}

func (c *Comment) IsArchived() bool {
	return c.activity.ArchivedAt != nil
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

func (c *Comment) AddIssue(issue CommentIssue) {
	c.issues = append(c.issues, issue)
}

func (c *Comment) RemoveIssue(issueID string) bool {
	for i, issue := range c.issues {
		if issue.ID == issueID {
			c.issues = append(c.issues[:i], c.issues[i+1:]...)
			return true
		}
	}
	return false
}

func (c *Comment) CheckBelongsTo(discussionID string) error {
	if c.discussionID != discussionID {
		return apperr.ErrInvalidArgument
	}
	return nil
}

func (c *Comment) Validate() error {
	if err := c.status.Validate(); err != nil {
		return err
	}
	return nil
}

func (c *Comment) Archive(now time.Time) error {
	if c.IsArchived() {
		return apperr.ErrInvalidArgument
	}
	c.activity.ArchivedAt = &now
	return nil
}

func (c *Comment) Unarchive() error {
	if !c.IsArchived() {
		return apperr.ErrInvalidArgument
	}
	c.activity.ArchivedAt = nil
	return nil
}

type CommentBody struct {
	Type    string
	Content string
}

type CommentActivity struct {
	CreatedBy  *string
	CreatedAt  time.Time
	ArchivedAt *time.Time
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
	CreatedBy   *string
}
