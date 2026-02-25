package domain

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type DiscussionRepository interface {
	MoveToProject(ctx context.Context, params MoveDiscussionsParams) error
}

type MoveDiscussionsParams struct {
	WorkspaceID   string
	DiscussionIDs []string
	ToProjectID   string
}

func (p MoveDiscussionsParams) Validate() error {
	if p.WorkspaceID == "" {
		return fmt.Errorf("workspace id is required: %w", apperr.ErrInvalidArgument)
	}
	if len(p.DiscussionIDs) == 0 {
		return fmt.Errorf("discussion ids are required: %w", apperr.ErrInvalidArgument)
	}
	if p.ToProjectID == "" {
		return fmt.Errorf("target project id is required: %w", apperr.ErrInvalidArgument)
	}
	return nil
}
