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
	WorkspaceRepository interface {
		Load(ctx context.Context, id string) (*Workspace, error)
		LoadBySlug(ctx context.Context, slug string) (*Workspace, error)
		Search(ctx context.Context, params SearchWorkspacesParams) ([]*Workspace, error)
		Save(ctx context.Context, workspace *Workspace) error
		Delete(ctx context.Context, workspace *Workspace) error
	}

	SearchWorkspacesParams struct {
		UserID string
	}
)

type (
	WorkspaceFactory struct {
		idSrv    id.Service
		clockSrv clock.Service
	}

	CreateWorkspaceParams struct {
		Slug string
		Name string
		Type WorkspaceType
		Plan Plan
	}

	ReconstructWorkspaceParams struct {
		ID           string
		Slug         string
		Name         string
		Type         WorkspaceType
		Subscription Subscription
		CreatedAt    time.Time
	}
)

func NewWorkspaceFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *WorkspaceFactory {
	return &WorkspaceFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

func (f *WorkspaceFactory) Create(params CreateWorkspaceParams) (*Workspace, error) {
	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	periodEnd := now.AddDate(0, 1, 0)
	return f.Reconstruct(ReconstructWorkspaceParams{
		ID:   id,
		Slug: params.Slug,
		Name: params.Name,
		Type: params.Type,
		Subscription: Subscription{
			Plan:               params.Plan,
			Status:             SubscriptionStatusActive,
			CurrentPeriodStart: now,
			CurrentPeriodEnd:   periodEnd,
		},
		CreatedAt: now,
	})
}

func (f *WorkspaceFactory) Reconstruct(params ReconstructWorkspaceParams) (*Workspace, error) {
	w := &Workspace{
		id:           params.ID,
		slug:         params.Slug,
		name:         params.Name,
		wsType:       params.Type,
		subscription: params.Subscription,
		createdAt:    params.CreatedAt,
	}

	if err := w.Validate(); err != nil {
		return nil, err
	}

	return w, nil
}

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

func NewPersonalWorkspaceID(userID string) string {
	return "personal-" + userID
}

type WorkspaceType string

const (
	WorkspaceTypePersonal     WorkspaceType = "personal"
	WorkspaceTypeOrganization WorkspaceType = "organization"
)

func (t WorkspaceType) String() string {
	return string(t)
}

func (t WorkspaceType) Validate() error {
	switch t {
	case WorkspaceTypePersonal, WorkspaceTypeOrganization:
		return nil
	default:
		return fmt.Errorf("invalid workspace type: %s: %w", t, apperr.ErrInvalidArgument)
	}
}

func (t WorkspaceType) IsPersonal() bool {
	return t == WorkspaceTypePersonal
}

func (t WorkspaceType) IsOrganization() bool {
	return t == WorkspaceTypeOrganization
}

type SubscriptionStatus string

const (
	SubscriptionStatusActive   SubscriptionStatus = "active"
	SubscriptionStatusCanceled SubscriptionStatus = "canceled"
	SubscriptionStatusPastDue  SubscriptionStatus = "past_due"
)

func (s SubscriptionStatus) String() string {
	return string(s)
}

func (s SubscriptionStatus) Validate() error {
	switch s {
	case SubscriptionStatusActive, SubscriptionStatusCanceled, SubscriptionStatusPastDue:
		return nil
	default:
		return fmt.Errorf("invalid subscription status %q: %w", s, apperr.ErrInvalidArgument)
	}
}

type Subscription struct {
	Plan                 Plan
	Status               SubscriptionStatus
	CurrentPeriodStart   time.Time
	CurrentPeriodEnd     time.Time
	StripeSubscriptionID *string
}

func (s Subscription) Validate() error {
	if err := s.Plan.Validate(); err != nil {
		return err
	}
	if err := s.Status.Validate(); err != nil {
		return err
	}
	if s.CurrentPeriodStart.IsZero() {
		return fmt.Errorf("subscription current period start is required: %w", apperr.ErrInvalidArgument)
	}
	if s.CurrentPeriodEnd.IsZero() {
		return fmt.Errorf("subscription current period end is required: %w", apperr.ErrInvalidArgument)
	}
	return nil
}

func (s Subscription) IsActive() bool {
	return s.Status == SubscriptionStatusActive
}
