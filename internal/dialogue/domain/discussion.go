package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

const (
	MaxCommentsPerDiscussion = 200
)

type DiscussionContent struct {
	Theme      string
	Premise    string
	Conclusion string
}

type DiscussionStats struct {
	CommentsCount         int
	ProposedCommentsCount int
	IssuesCount           int
}

type DiscussionAudit struct {
	CreatedBy       string
	CreatedAt       time.Time
	ArchivedAt      *time.Time
	LastCommentedAt time.Time
}

type Discussion struct {
	id          string
	workspaceID string
	content     DiscussionContent
	status      DiscussionStatus
	settings    DiscussionSettings
	stats       DiscussionStats
	audit       DiscussionAudit
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) WorkspaceID() string {
	return d.workspaceID
}

func (d *Discussion) Theme() string {
	return d.content.Theme
}

func (d *Discussion) Premise() string {
	return d.content.Premise
}

func (d *Discussion) Conclusion() string {
	return d.content.Conclusion
}

func (d *Discussion) Status() DiscussionStatus {
	return d.status
}

func (d *Discussion) Settings() DiscussionSettings {
	return d.settings
}

func (d *Discussion) CommentsCount() int {
	return d.stats.CommentsCount
}

func (d *Discussion) ProposedCommentsCount() int {
	return d.stats.ProposedCommentsCount
}

func (d *Discussion) IssuesCount() int {
	return d.stats.IssuesCount
}

func (d *Discussion) LastCommentedAt() time.Time {
	return d.audit.LastCommentedAt
}

func (d *Discussion) ArchivedAt() *time.Time {
	return d.audit.ArchivedAt
}

func (d *Discussion) IsArchived() bool {
	return d.audit.ArchivedAt != nil
}

func (d *Discussion) CreatedBy() string {
	return d.audit.CreatedBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.audit.CreatedAt
}

func (d *Discussion) CanAddComment() error {
	if d.IsArchived() {
		return fmt.Errorf("discussion is archived: %w", apperr.ErrPermissionDenied)
	}
	if d.stats.CommentsCount >= MaxCommentsPerDiscussion {
		return fmt.Errorf("discussion has reached the limit of %d comments: %w", MaxCommentsPerDiscussion, apperr.ErrLimitExceeded)
	}
	return nil
}

func (d *Discussion) AddComment(now time.Time) {
	d.stats.CommentsCount++
	d.stats.ProposedCommentsCount++
	d.audit.LastCommentedAt = now
}

func (d *Discussion) AddCommentIssue() {
	d.stats.IssuesCount++
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
