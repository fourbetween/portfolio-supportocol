package domain

import (
	"time"
)

type (
	Discussion struct {
		id        string
		theme     string
		createdBy string
		createdAt time.Time
	}

	UpdateParams struct {
		Theme string
	}

	CreateCommentParams struct {
		ParentCommentID string
		CommentType     string
		Content         string
		PostedBy        string
	}
)

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) Theme() string {
	return d.theme
}

func (d *Discussion) CreatedBy() string {
	return d.createdBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.createdAt
}
