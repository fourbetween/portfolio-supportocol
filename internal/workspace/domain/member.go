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
	MemberRepository interface {
		Load(ctx context.Context, workspaceID, userID string) (*Member, error)
		Search(ctx context.Context, params SearchMembersParams) ([]*Member, error)
		Save(ctx context.Context, member *Member) error
		Delete(ctx context.Context, member *Member) error
	}

	SearchMembersParams struct {
		WorkspaceID string
	}

	FavoriteDiscussionRepository interface {
		Save(ctx context.Context, fav FavoriteDiscussion) error
		Delete(ctx context.Context, memberID, discussionID string) error
		CountByMemberID(ctx context.Context, memberID string) (int, error)
	}

	DiscussionFavoritesService interface {
		IncrementFavoritesCount(ctx context.Context, discussionID string) error
		DecrementFavoritesCount(ctx context.Context, discussionID string) error
	}
)

type (
	MemberFactory struct {
		idSrv    id.Service
		clockSrv clock.Service
	}

	CreateMemberParams struct {
		WorkspaceID string
		UserID      string
		Role        MemberRole
	}

	ReconstructMemberParams struct {
		ID          string
		WorkspaceID string
		UserID      string
		Role        MemberRole
		CreatedAt   time.Time
	}
)

func NewMemberFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *MemberFactory {
	return &MemberFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

func (f *MemberFactory) Create(params CreateMemberParams) (*Member, error) {
	id := f.idSrv.Generate()
	now := f.clockSrv.Now()
	return f.Reconstruct(ReconstructMemberParams{
		ID:          id,
		WorkspaceID: params.WorkspaceID,
		UserID:      params.UserID,
		Role:        params.Role,
		CreatedAt:   now,
	})
}

func (f *MemberFactory) Reconstruct(params ReconstructMemberParams) (*Member, error) {
	m := &Member{
		id:          params.ID,
		workspaceID: params.WorkspaceID,
		userID:      params.UserID,
		role:        params.Role,
		createdAt:   params.CreatedAt,
	}

	if err := m.Validate(); err != nil {
		return nil, err
	}

	return m, nil
}

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

const MaxFavoriteCount = 100

type FavoriteDiscussion struct {
	MemberID     string
	DiscussionID string
	CreatedAt    time.Time
}

func (f FavoriteDiscussion) Validate() error {
	if f.MemberID == "" {
		return fmt.Errorf("member id is required: %w", apperr.ErrInvalidArgument)
	}
	if f.DiscussionID == "" {
		return fmt.Errorf("discussion id is required: %w", apperr.ErrInvalidArgument)
	}
	return nil
}
