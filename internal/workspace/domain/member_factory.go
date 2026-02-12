package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type MemberFactory struct {
	idSrv    id.Service
	clockSrv clock.Service
}

func NewMemberFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *MemberFactory {
	return &MemberFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

type CreateMemberParams struct {
	WorkspaceID string
	UserID      string
	Role        MemberRole
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

type ReconstructMemberParams struct {
	ID          string
	WorkspaceID string
	UserID      string
	Role        MemberRole
	CreatedAt   time.Time
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
