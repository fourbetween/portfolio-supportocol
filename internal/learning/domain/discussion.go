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

type Discussion struct {
	id                    string
	workspaceID           string
	projectID             string
	theme                 string
	conclusion            string
	status                DiscussionStatus
	commentsCount         int
	proposedCommentsCount int
	issuesCount           int
	lastCommentedAt       time.Time
	archivedAt            *time.Time
	createdBy             string
	createdAt             time.Time
	dialogueSettings      *DialogueSettings
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
	return d.theme
}

func (d *Discussion) Conclusion() string {
	return d.conclusion
}

func (d *Discussion) Status() DiscussionStatus {
	return d.status
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

func (d *Discussion) CreatedBy() string {
	return d.createdBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.createdAt
}

func (d *Discussion) DialogueSettings() *DialogueSettings {
	return d.dialogueSettings
}

func (d *Discussion) ArchivedAt() *time.Time {
	return d.archivedAt
}

func (d *Discussion) IsArchived() bool {
	return d.archivedAt != nil
}

func (d *Discussion) CanAddComment() error {
	if d.commentsCount >= MaxCommentsPerDiscussion {
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
	d.commentsCount += count
	d.lastCommentedAt = now
}

func (d *Discussion) SyncCommentsCount(count int) {
	d.commentsCount = count
}

type UpdateParams struct {
	Theme      string
	Conclusion string
}

func (d *Discussion) Update(params UpdateParams) error {
	d.theme = params.Theme
	d.conclusion = params.Conclusion
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
	d.archivedAt = &now
	return nil
}

func (d *Discussion) Unarchive() error {
	if !d.IsArchived() {
		return fmt.Errorf("discussion is not archived: %w", apperr.ErrInvalidArgument)
	}
	d.archivedAt = nil
	return nil
}

func (d *Discussion) EnsureCommentFrameRequirement(commentType string, parentType string) {
	if !d.status.RequiresDialogueSettings() || d.dialogueSettings == nil {
		return
	}

	d.dialogueSettings.CommentFrame = d.dialogueSettings.CommentFrame.Add(commentType, parentType)
}
