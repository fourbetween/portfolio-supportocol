package domain

import (
	"time"
)

type Discussion struct {
	id        string
	theme     string
	createdBy string
	createdAt time.Time
}

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

type UpdateParams struct {
	Theme string
}

func (d *Discussion) Update(params UpdateParams) error {
	d.theme = params.Theme
	return nil
}
