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
	id            string
	theme         string
	settings      DiscussionSettings
	commentsCount int
	createdBy     string
	createdAt     time.Time
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

func (d *Discussion) CommentsCount() int {
	return d.commentsCount
}

func (d *Discussion) CreatedBy() string {
	return d.createdBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.createdAt
}

func (d *Discussion) CanAddComment() error {
	if d.commentsCount >= MaxCommentsPerDiscussion {
		return fmt.Errorf("discussion has reached the limit of %d comments: %w", MaxCommentsPerDiscussion, apperr.ErrLimitExceeded)
	}
	return nil
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
		pt := parent.CommentType()
		parentType = &pt
	}
	return d.settings.CommentFrame.ValidateComment(commentType, parentType)
}
