package domain

import (
	"context"
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type (
	ProjectRepository interface {
		Load(ctx context.Context, params LoadProjectParams) (*Project, error)
		Search(ctx context.Context, params SearchProjectsParams) ([]*Project, error)
		CountByWorkspaceID(ctx context.Context, workspaceID string) (int, error)
		Save(ctx context.Context, project *Project) error
		Delete(ctx context.Context, project *Project) error
	}

	LoadProjectParams struct {
		ID          string
		WorkspaceID string
	}

	SearchProjectsParams struct {
		WorkspaceID string
	}
)

type (
	ProjectFactory struct {
		idSrv    id.Service
		clockSrv clock.Service
	}

	CreateProjectParams struct {
		WorkspaceID string
		Name        string
		IsDefault   bool
	}

	ReconstructProjectParams struct {
		ID          string
		WorkspaceID string
		Name        string
		IsDefault   bool
		Premise     string
		CreatedAt   time.Time
	}
)

func NewProjectFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *ProjectFactory {
	return &ProjectFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

func (f *ProjectFactory) Create(params CreateProjectParams) (*Project, error) {
	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	return f.Reconstruct(ReconstructProjectParams{
		ID:          id,
		WorkspaceID: params.WorkspaceID,
		Name:        params.Name,
		IsDefault:   params.IsDefault,
		CreatedAt:   now,
	})
}

func (f *ProjectFactory) Reconstruct(params ReconstructProjectParams) (*Project, error) {
	p := &Project{
		id:          params.ID,
		workspaceID: params.WorkspaceID,
		name:        params.Name,
		premise:     params.Premise,
		isDefault:   params.IsDefault,
		createdAt:   params.CreatedAt,
	}

	if err := p.Validate(); err != nil {
		return nil, err
	}

	return p, nil
}

type Project struct {
	id          string
	workspaceID string
	name        string
	premise     string
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

func (p *Project) Premise() string {
	return p.premise
}

func (p *Project) IsDefault() bool {
	return p.isDefault
}

func (p *Project) CreatedAt() time.Time {
	return p.createdAt
}

type UpdateProjectParams struct {
	Name    string
	Premise string
}

func (p *Project) Update(params UpdateProjectParams) error {
	if p.isDefault {
		return fmt.Errorf("default project cannot be updated: %w", apperr.ErrPermissionDenied)
	}
	if params.Name == "" {
		return fmt.Errorf("project name is required: %w", apperr.ErrInvalidArgument)
	}
	p.name = params.Name
	p.premise = params.Premise
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
