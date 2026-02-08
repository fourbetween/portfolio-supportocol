package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type CommentBody struct {
	Type    string
	Content string
}

type CommentActivity struct {
	CreatedBy  *string
	CreatedAt  time.Time
	ArchivedAt *time.Time
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

func (c *Comment) ArchivedAt() *time.Time {
	return c.activity.ArchivedAt
}

func (c *Comment) IsArchived() bool {
	return c.activity.ArchivedAt != nil
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
