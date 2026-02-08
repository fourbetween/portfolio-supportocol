package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
)

type MemberFactory struct {
	clockSrv clock.Service
}

func NewMemberFactory(
	clockSrv clock.Service,
) *MemberFactory {
	return &MemberFactory{
		clockSrv: clockSrv,
	}
}

type CreateMemberParams struct {
	WorkspaceID string
	UserID      string
	Role        MemberRole
}

func (f *MemberFactory) Create(params CreateMemberParams) (*Member, error) {
	now := f.clockSrv.Now()
	return f.Reconstruct(ReconstructMemberParams{
		WorkspaceID: params.WorkspaceID,
		UserID:      params.UserID,
		Role:        params.Role,
		CreatedAt:   now,
	})
}

type ReconstructMemberParams struct {
	WorkspaceID string
	UserID      string
	Role        MemberRole
	CreatedAt   time.Time
}

func (f *MemberFactory) Reconstruct(params ReconstructMemberParams) (*Member, error) {
	m := &Member{
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
