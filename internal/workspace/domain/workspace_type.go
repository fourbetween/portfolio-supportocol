package domain

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

// WorkspaceType はワークスペースの種類を表す値オブジェクト
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
