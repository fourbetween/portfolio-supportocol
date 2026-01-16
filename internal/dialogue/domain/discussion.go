package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type Discussion struct {
	id        string
	theme     string
	settings  DiscussionSettings
	createdBy string
	createdAt time.Time
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) Theme() string {
	return d.theme
}

func (d *Discussion) Settings() DiscussionSettings {
	return d.settings
}

func (d *Discussion) CreatedBy() string {
	return d.createdBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.createdAt
}

func (d *Discussion) ValidateComment(commentType string, parent *Comment) error {
	var parentType *string
	if parent != nil {
		if parent.DiscussionID() != d.id {
			return apperr.ErrInvalidArgument
		}
		pt := parent.CommentType()
		parentType = &pt
	}
	return d.settings.CommentFrame.ValidateComment(commentType, parentType)
}
