package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

// Workspace はワークスペースのエンティティ
type Workspace struct {
	id        string
	slug      string
	name      string
	wsType    WorkspaceType
	createdAt time.Time
}

func (w *Workspace) ID() string {
	return w.id
}

func (w *Workspace) Slug() string {
	return w.slug
}

func (w *Workspace) Name() string {
	return w.name
}

func (w *Workspace) Type() WorkspaceType {
	return w.wsType
}

func (w *Workspace) CreatedAt() time.Time {
	return w.createdAt
}

func (w *Workspace) IsPersonal() bool {
	return w.wsType.IsPersonal()
}

func (w *Workspace) IsOrganization() bool {
	return w.wsType.IsOrganization()
}

// UpdateParams はワークスペースの更新パラメータ
type UpdateWorkspaceParams struct {
	Name string
}

func (w *Workspace) Update(params UpdateWorkspaceParams) error {
	if params.Name == "" {
		return fmt.Errorf("workspace name is required: %w", apperr.ErrInvalidArgument)
	}
	w.name = params.Name
	return nil
}

func (w *Workspace) Validate() error {
	if w.id == "" {
		return fmt.Errorf("workspace id is required: %w", apperr.ErrInvalidArgument)
	}
	if w.slug == "" {
		return fmt.Errorf("workspace slug is required: %w", apperr.ErrInvalidArgument)
	}
	if w.name == "" {
		return fmt.Errorf("workspace name is required: %w", apperr.ErrInvalidArgument)
	}
	if err := w.wsType.Validate(); err != nil {
		return err
	}
	return nil
}
