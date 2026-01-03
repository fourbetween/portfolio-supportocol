package domain

import (
	"time"
)

type Discussion struct {
	id        string
	theme     DiscussionTheme
	createdBy string
	createdAt time.Time
}

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) Theme() string {
	return d.theme.String()
}

func (d *Discussion) CreatedBy() string {
	return d.createdBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.createdAt
}

type UpdateParams struct {
	Theme string
}

func (d *Discussion) Update(params UpdateParams) error {
	theme, err := NewDiscussionTheme(params.Theme)
	if err != nil {
		return err
	}
	d.theme = theme
	return nil
}
