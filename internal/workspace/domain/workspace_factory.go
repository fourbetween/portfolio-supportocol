package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type WorkspaceFactory struct {
	idSrv    id.Service
	clockSrv clock.Service
}

func NewWorkspaceFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *WorkspaceFactory {
	return &WorkspaceFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

type CreateWorkspaceParams struct {
	Slug string
	Name string
	Type WorkspaceType
}

func (f *WorkspaceFactory) Create(params CreateWorkspaceParams) (*Workspace, error) {
	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	return f.Reconstruct(ReconstructWorkspaceParams{
		ID:        id,
		Slug:      params.Slug,
		Name:      params.Name,
		Type:      params.Type,
		CreatedAt: now,
	})
}

type ReconstructWorkspaceParams struct {
	ID        string
	Slug      string
	Name      string
	Type      WorkspaceType
	CreatedAt time.Time
}

func (f *WorkspaceFactory) Reconstruct(params ReconstructWorkspaceParams) (*Workspace, error) {
	w := &Workspace{
		id:        params.ID,
		slug:      params.Slug,
		name:      params.Name,
		wsType:    params.Type,
		createdAt: params.CreatedAt,
	}

	if err := w.Validate(); err != nil {
		return nil, err
	}

	return w, nil
}
