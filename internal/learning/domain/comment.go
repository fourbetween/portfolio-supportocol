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
	content         CommentContent
	status          CommentStatus
	postedBy        string
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
	return c.content.String()
}

func (c *Comment) Status() CommentStatus {
	return c.status
}

func (c *Comment) PostedBy() string {
	return c.postedBy
}

func (c *Comment) CreatedAt() time.Time {
	return c.createdAt
}

type UpdateCommentParams struct {
	CommentType string
	Content     string
}

func (c *Comment) Update(params UpdateCommentParams) error {
	content, err := NewCommentContent(params.Content)
	if err != nil {
		return err
	}
	c.commentType = params.CommentType
	c.content = content
	return nil
}

func (c *Comment) UpdateStatus(status CommentStatus) error {
	if !status.IsValid() {
		return apperr.ErrInvalidRequest
	}
	if c.status == CommentStatusActive && status == CommentStatusProposed {
		return apperr.ErrInvalidRequest
	}
	c.status = status
	return nil
}
