package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

const (
	MaxCommentsPerDiscussion = 200
	MaxDiscussionsPerProject = 100
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

type DiscussionActivity struct {
	CreatedBy       string
	CreatedAt       time.Time
	ArchivedAt      *time.Time
	LastCommentedAt time.Time
}

type Discussion struct {
	id               string
	workspaceID      string
	projectID        string
	content          DiscussionContent
	status           DiscussionStatus
	stats            DiscussionStats
	activity         DiscussionActivity
	dialogueSettings *DialogueSettings
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) WorkspaceID() string {
	return d.workspaceID
}

func (d *Discussion) ProjectID() string {
	return d.projectID
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
	return d.activity.LastCommentedAt
}

func (d *Discussion) CreatedBy() string {
	return d.activity.CreatedBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.activity.CreatedAt
}

func (d *Discussion) DialogueSettings() *DialogueSettings {
	return d.dialogueSettings
}

func (d *Discussion) ArchivedAt() *time.Time {
	return d.activity.ArchivedAt
}

func (d *Discussion) IsArchived() bool {
	return d.activity.ArchivedAt != nil
}

func (d *Discussion) CanAddComment() error {
	if d.stats.CommentsCount >= MaxCommentsPerDiscussion {
		return fmt.Errorf(
			"discussion has reached the limit of %d comments: %w",
			MaxCommentsPerDiscussion,
			apperr.ErrLimitExceeded,
		)
	}
	return nil
}

func (d *Discussion) AddComment(now time.Time) {
	d.AddComments(1, now)
}

func (d *Discussion) AddComments(count int, now time.Time) {
	d.stats.CommentsCount += count
	d.activity.LastCommentedAt = now
}

func (d *Discussion) ResolveProposedComment(now time.Time) {
	if d.stats.ProposedCommentsCount > 0 {
		d.stats.ProposedCommentsCount--
		d.stats.CommentsCount++
		d.activity.LastCommentedAt = now
	}
}

func (d *Discussion) AddCommentIssue() {
	d.stats.IssuesCount++
}

func (d *Discussion) RemoveCommentIssue() {
	if d.stats.IssuesCount > 0 {
		d.stats.IssuesCount--
	}
}

func (d *Discussion) SyncCommentsCount(count int) {
	d.stats.CommentsCount = count
}

func (d *Discussion) SyncCounts(counts DiscussionCounts) {
	d.stats.CommentsCount = counts.CommentsCount
	d.stats.ProposedCommentsCount = counts.ProposedCommentsCount
	d.stats.IssuesCount = counts.IssuesCount
}

type UpdateParams struct {
	Theme      string
	Premise    string
	Conclusion string
}

func (d *Discussion) Update(params UpdateParams) error {
	d.content.Theme = params.Theme
	d.content.Premise = params.Premise
	d.content.Conclusion = params.Conclusion
	return nil
}

type UpdateStatusParams struct {
	Status            DiscussionStatus
	CommentFrame      *CommentFrame
	CommentPermission PermissionLevel
	IssuePermission   PermissionLevel
}

func (d *Discussion) UpdateStatus(params UpdateStatusParams) error {
	if err := params.Status.Validate(); err != nil {
		return fmt.Errorf("invalid discussion status: %s: %w", params.Status, err)
	}

	if params.Status.RequiresDialogueSettings() {
		if params.CommentFrame == nil {
			return fmt.Errorf("comment frame is required for %s status: %w", params.Status, apperr.ErrInvalidArgument)
		}
		d.dialogueSettings = &DialogueSettings{
			CommentFrame:      params.CommentFrame.Sorted(),
			CommentPermission: params.CommentPermission,
			IssuePermission:   params.IssuePermission,
		}
	} else {
		d.dialogueSettings = nil
	}

	d.status = params.Status
	return d.Validate()
}

func (d *Discussion) Validate() error {
	if err := d.status.Validate(); err != nil {
		return err
	}
	if d.status.RequiresDialogueSettings() {
		if d.dialogueSettings == nil {
			return fmt.Errorf("dialogue settings is required for %s status: %w", d.status, apperr.ErrInvalidArgument)
		}
		if err := d.dialogueSettings.Validate(); err != nil {
			return err
		}
	}
	if d.status.IsPrivate() && d.dialogueSettings != nil {
		return fmt.Errorf("dialogue settings must be nil for private status: %w", apperr.ErrInvalidArgument)
	}
	return nil
}

func (d *Discussion) Archive(now time.Time) error {
	if d.IsArchived() {
		return fmt.Errorf("discussion is already archived: %w", apperr.ErrInvalidArgument)
	}
	d.activity.ArchivedAt = &now
	return nil
}

func (d *Discussion) Unarchive() error {
	if !d.IsArchived() {
		return fmt.Errorf("discussion is not archived: %w", apperr.ErrInvalidArgument)
	}
	d.activity.ArchivedAt = nil
	return nil
}

func (d *Discussion) EnsureCommentFrameRequirement(commentType string, parentType string) {
	if !d.status.RequiresDialogueSettings() || d.dialogueSettings == nil {
		return
	}

	d.dialogueSettings.CommentFrame = d.dialogueSettings.CommentFrame.Add(commentType, parentType)
}
