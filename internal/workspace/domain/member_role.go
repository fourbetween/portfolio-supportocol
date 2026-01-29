package domain

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type MemberRole string

const (
	MemberRoleOwner  MemberRole = "owner"
	MemberRoleAdmin  MemberRole = "admin"
	MemberRoleMember MemberRole = "member"
)

func (r MemberRole) String() string {
	return string(r)
}

func (r MemberRole) Validate() error {
	switch r {
	case MemberRoleOwner, MemberRoleAdmin, MemberRoleMember:
		return nil
	default:
		return fmt.Errorf("invalid member role: %s: %w", r, apperr.ErrInvalidArgument)
	}
}

func (r MemberRole) IsOwner() bool {
	return r == MemberRoleOwner
}

func (r MemberRole) IsAdmin() bool {
	return r == MemberRoleAdmin
}

func (r MemberRole) IsMember() bool {
	return r == MemberRoleMember
}

func (r MemberRole) CanManageWorkspace() bool {
	return r.IsOwner() || r.IsAdmin()
}

func (r MemberRole) CanManageMembers() bool {
	return r.IsOwner() || r.IsAdmin()
}

func (r MemberRole) CanManageProjects() bool {
	return r.IsOwner() || r.IsAdmin()
}
