package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type Project struct {
	id          string
	workspaceID string
	name        string
	isDefault   bool
	createdAt   time.Time
}

func (p *Project) ID() string {
	return p.id
}

func (p *Project) WorkspaceID() string {
	return p.workspaceID
}

func (p *Project) Name() string {
	return p.name
}

func (p *Project) IsDefault() bool {
	return p.isDefault
}

func (p *Project) CreatedAt() time.Time {
	return p.createdAt
}

type UpdateProjectParams struct {
	Name string
}

func (p *Project) Update(params UpdateProjectParams) error {
	if params.Name == "" {
		return fmt.Errorf("project name is required: %w", apperr.ErrInvalidArgument)
	}
	p.name = params.Name
	return nil
}

func (p *Project) Validate() error {
	if p.id == "" {
		return fmt.Errorf("project id is required: %w", apperr.ErrInvalidArgument)
	}
	if p.workspaceID == "" {
		return fmt.Errorf("workspace id is required: %w", apperr.ErrInvalidArgument)
	}
	if p.name == "" {
		return fmt.Errorf("project name is required: %w", apperr.ErrInvalidArgument)
	}
	return nil
}
