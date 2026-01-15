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
	if !status.IsValid() {
		return apperr.ErrInvalidArgument
	}
	if c.status == CommentStatusActive && status == CommentStatusProposed {
		return apperr.ErrInvalidArgument
	}
	c.status = status
	return nil
}

func (c *Comment) CheckBelongsTo(discussionID string) error {
	if c.discussionID != discussionID {
		return apperr.ErrInvalidArgument
	}
	return nil
}

func (c *Comment) validate() error {
	if !c.status.IsValid() {
		return apperr.ErrInvalidArgument
	}
	return nil
}
