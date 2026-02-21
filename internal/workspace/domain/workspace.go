package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type Workspace struct {
	id           string
	slug         string
	name         string
	wsType       WorkspaceType
	subscription Subscription
	createdAt    time.Time
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

func (w *Workspace) Subscription() Subscription {
	return w.subscription
}

const MaxProjectsForPersonalWorkspace = 20

func (w *Workspace) CanAddProject(currentCount int) error {
	if w.IsPersonal() && currentCount >= MaxProjectsForPersonalWorkspace {
		return fmt.Errorf("project limit exceeded for personal workspace: %w", apperr.ErrLimitExceeded)
	}
	return nil
}

func (w *Workspace) CanUseAI(currentUsageCount int) error {
	limit := w.subscription.Plan.MonthlyAILimit
	if currentUsageCount >= limit {
		return fmt.Errorf("monthly AI usage limit exceeded (%d/%d): %w", currentUsageCount, limit, apperr.ErrLimitExceeded)
	}
	return nil
}

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
	if err := w.subscription.Validate(); err != nil {
		return err
	}
	return nil
}
