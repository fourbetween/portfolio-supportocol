package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type Member struct {
	id          string
	workspaceID string
	userID      string
	role        MemberRole
	createdAt   time.Time
}

func (m *Member) ID() string {
	return m.id
}

func (m *Member) WorkspaceID() string {
	return m.workspaceID
}

func (m *Member) UserID() string {
	return m.userID
}

func (m *Member) Role() MemberRole {
	return m.role
}

func (m *Member) CreatedAt() time.Time {
	return m.createdAt
}

func (m *Member) IsOwner() bool {
	return m.role.IsOwner()
}

func (m *Member) IsAdmin() bool {
	return m.role.IsAdmin()
}

func (m *Member) IsMember() bool {
	return m.role.IsMember()
}

func (m *Member) CanManageWorkspace() bool {
	return m.role.CanManageWorkspace()
}

func (m *Member) CanManageMembers() bool {
	return m.role.CanManageMembers()
}

func (m *Member) CanManageProjects() bool {
	return m.role.CanManageProjects()
}

type UpdateMemberParams struct {
	Role MemberRole
}

func (m *Member) Update(params UpdateMemberParams) error {
	if err := params.Role.Validate(); err != nil {
		return err
	}
	m.role = params.Role
	return nil
}

func (m *Member) Validate() error {
	if m.id == "" {
		return fmt.Errorf("id is required: %w", apperr.ErrInvalidArgument)
	}
	if m.workspaceID == "" {
		return fmt.Errorf("workspace id is required: %w", apperr.ErrInvalidArgument)
	}
	if m.userID == "" {
		return fmt.Errorf("user id is required: %w", apperr.ErrInvalidArgument)
	}
	if err := m.role.Validate(); err != nil {
		return err
	}
	return nil
}
