package domain

import (
	"time"
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
