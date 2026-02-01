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

func (c *Comment) Issues() []CommentIssue {
	return c.issues
}

func (c *Comment) ArchivedAt() *time.Time {
	return c.archivedAt
}

func (c *Comment) IsArchived() bool {
	return c.archivedAt != nil
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

func (c *Comment) AddIssue(issueID string, status CommentIssueStatus, createdBy *string) bool {
	for i, issue := range c.issues {
		if issue.IssueID == issueID {
			if issue.Status == status {
				return false
			}
			c.issues[i].Status = status
			return true
		}
	}
	c.issues = append(c.issues, CommentIssue{
		IssueID:   issueID,
		Status:    status,
		CreatedBy: createdBy,
	})
	return true
}

func (c *Comment) UpdateIssueStatus(issueID string, status CommentIssueStatus) (bool, error) {
	if err := status.Validate(); err != nil {
		return false, err
	}
	for i, issue := range c.issues {
		if issue.IssueID == issueID {
			if issue.Status == status {
				return false, nil
			}
			c.issues[i].Status = status
			return true, nil
		}
	}
	return false, apperr.ErrNotFound
}

func (c *Comment) RemoveIssue(issueID string) bool {
	for i, issue := range c.issues {
		if issue.IssueID == issueID {
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
	c.archivedAt = &now
	return nil
}

func (c *Comment) Unarchive() error {
	if !c.IsArchived() {
		return apperr.ErrInvalidArgument
	}
	c.archivedAt = nil
	return nil
}
