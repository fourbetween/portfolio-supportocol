package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type ListDiscussionsUsecase struct {
	qs     DiscussionQueryService
	permSv domain.PermissionService
}

func NewListDiscussionsUsecase(qs DiscussionQueryService, permSv domain.PermissionService) *ListDiscussionsUsecase {
	return &ListDiscussionsUsecase{
		qs:     qs,
		permSv: permSv,
	}
}

type ListDiscussionsInput struct {
	WorkspaceID string
	ProjectID   string
	UserID      string
	Archived    bool
}

func (u *ListDiscussionsUsecase) Execute(ctx context.Context, input ListDiscussionsInput) ([]DiscussionSummary, error) {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	return u.qs.ListDiscussions(ctx, ListDiscussionsParams{
		WorkspaceID: input.WorkspaceID,
		ProjectID:   input.ProjectID,
		Archived:    input.Archived,
	})
}
