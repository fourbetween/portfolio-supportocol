package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type Comment struct {
	id              string
	discussionID    string
	parentCommentID *string
	commentType     string
	content         string
	status          CommentStatus
	archivedAt      *time.Time
	createdBy       *string
	createdAt       time.Time
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

func (c *Comment) CommentType() string {
	return c.commentType
}

func (c *Comment) Content() string {
	return c.content
}

func (c *Comment) Status() CommentStatus {
	return c.status
}

func (c *Comment) ArchivedAt() *time.Time {
	return c.archivedAt
}

func (c *Comment) IsArchived() bool {
	return c.archivedAt != nil
}

func (c *Comment) CreatedBy() *string {
	return c.createdBy
}

func (c *Comment) CreatedAt() time.Time {
	return c.createdAt
}

type UpdateCommentParams struct {
	CommentType string
	Content     string
}

func (c *Comment) Update(params UpdateCommentParams) error {
	c.commentType = params.CommentType
	c.content = params.Content
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
