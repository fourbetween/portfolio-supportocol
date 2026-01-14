package domain

import (
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

type PublishParams struct {
	CommentFrame CommentFrame
}

func (d *Discussion) Publish(params PublishParams) error {
	if d.status.IsPublic() {
		return apperr.ErrInvalidArgument
	}

	d.status = DiscussionStatusPublic
	d.dialogueSettings = &DialogueSettings{
		DiscussionID: d.id,
		CommentFrame: params.CommentFrame,
	}

	return d.validate()
}

func (d *Discussion) validate() error {
	if d.status.IsPublic() && d.dialogueSettings == nil {
		return apperr.ErrInvalidArgument
	}
	if d.status.IsPrivate() && d.dialogueSettings != nil {
		return apperr.ErrInvalidArgument
	}
	return nil
}
