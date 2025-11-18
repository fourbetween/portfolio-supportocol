package project

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal"
)

var (
	ErrNotFound = fmt.Errorf("project: %w", internal.ErrNotFound)
)

type (
	Project struct {
		id        string
		name      string
		createdBy string
		createdAt time.Time

		repo Repository
	}
)

func (p Project) ID() string {
	return p.id
}

func (p Project) Name() string {
	return p.name
}

func (p Project) CreatedBy() string {
	return p.createdBy
}

func (p Project) CreatedAt() time.Time {
	return p.createdAt
}

func (p *Project) UpdateName(name string) {
	p.name = name
}

func (p Project) Save() error {
	return p.repo.Save(p)
}
