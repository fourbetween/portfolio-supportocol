package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

const (
	MaxCommentsPerDiscussion = 200
)

type Discussion struct {
	id                    string
	workspaceID           string
	theme                 string
	premise               string
	conclusion            string
	status                DiscussionStatus
	settings              DiscussionSettings
	commentsCount         int
	proposedCommentsCount int
	issuesCount           int
	lastCommentedAt       time.Time
	archivedAt            *time.Time
	createdBy             string
	createdAt             time.Time
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) WorkspaceID() string {
	return d.workspaceID
}

func (d *Discussion) Theme() string {
	return d.theme
}

func (d *Discussion) Premise() string {
	return d.premise
}

func (d *Discussion) Conclusion() string {
	return d.conclusion
}

func (d *Discussion) Status() DiscussionStatus {
	return d.status
}

func (d *Discussion) Settings() DiscussionSettings {
	return d.settings
}

func (d *Discussion) CommentsCount() int {
	return d.commentsCount
}

func (d *Discussion) ProposedCommentsCount() int {
	return d.proposedCommentsCount
}

func (d *Discussion) IssuesCount() int {
	return d.issuesCount
}

func (d *Discussion) LastCommentedAt() time.Time {
	return d.lastCommentedAt
}

func (d *Discussion) ArchivedAt() *time.Time {
	return d.archivedAt
}

func (d *Discussion) IsArchived() bool {
	return d.archivedAt != nil
}

func (d *Discussion) CreatedBy() string {
	return d.createdBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.createdAt
}

func (d *Discussion) CanAddComment() error {
	if d.IsArchived() {
		return fmt.Errorf("discussion is archived: %w", apperr.ErrPermissionDenied)
	}
	if d.commentsCount >= MaxCommentsPerDiscussion {
		return fmt.Errorf("discussion has reached the limit of %d comments: %w", MaxCommentsPerDiscussion, apperr.ErrLimitExceeded)
	}
	return nil
}

func (d *Discussion) AddComment(now time.Time) {
	d.commentsCount++
	d.proposedCommentsCount++
	d.lastCommentedAt = now
}

func (d *Discussion) AddCommentIssue() {
	d.issuesCount++
}

func (d *Discussion) ValidateComment(commentType string, parent *Comment) error {
	if err := d.CanAddComment(); err != nil {
		return err
	}
	var parentType *string
	if parent != nil {
		if parent.DiscussionID() != d.id {
			return apperr.ErrInvalidArgument
		}
		pt := parent.Type()
		parentType = &pt
	}
	return d.settings.CommentFrame.ValidateComment(commentType, parentType)
}
