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
	if err := params.Status.Validate(); err != nil {
		return fmt.Errorf("invalid discussion status: %s: %w", params.Status, err)
	}

	if params.Status.IsPublic() {
		if params.CommentFrame == nil {
			return fmt.Errorf("comment frame is required for public status: %w", apperr.ErrInvalidArgument)
		}
		d.dialogueSettings = &DialogueSettings{
			CommentFrame: *params.CommentFrame,
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
	if d.status.IsPublic() {
		if d.dialogueSettings == nil {
			return fmt.Errorf("dialogue settings is required for public status: %w", apperr.ErrInvalidArgument)
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
