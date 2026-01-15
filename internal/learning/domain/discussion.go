package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type Discussion struct {
	id               string
	theme            string
	status           DiscussionStatus
	createdBy        string
	createdAt        time.Time
	dialogueSettings *DialogueSettings
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) Theme() string {
	return d.theme
}

func (d *Discussion) Status() DiscussionStatus {
	return d.status
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

type UpdateParams struct {
	Theme string
}

func (d *Discussion) Update(params UpdateParams) error {
	d.theme = params.Theme
	return nil
}

type UpdateStatusParams struct {
	Status       DiscussionStatus
	CommentFrame *CommentFrame
}

func (d *Discussion) UpdateStatus(params UpdateStatusParams) error {
	if !params.Status.IsValid() {
		return fmt.Errorf("invalid discussion status: %s: %w", params.Status, apperr.ErrInvalidArgument)
	}

	if params.Status.IsPublic() {
		if params.CommentFrame == nil {
			return fmt.Errorf("comment frame is required for public status: %w", apperr.ErrInvalidArgument)
		}
		d.dialogueSettings = &DialogueSettings{
			DiscussionID: d.id,
			CommentFrame: *params.CommentFrame,
		}
	} else {
		d.dialogueSettings = nil
	}

	d.status = params.Status
	return d.validate()
}

func (d *Discussion) validate() error {
	if d.status.IsPublic() && d.dialogueSettings == nil {
		return fmt.Errorf("dialogue settings is required for public status: %w", apperr.ErrInvalidArgument)
	}
	if d.status.IsPrivate() && d.dialogueSettings != nil {
		return fmt.Errorf("dialogue settings must be nil for private status: %w", apperr.ErrInvalidArgument)
	}
	return nil
}
