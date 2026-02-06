package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
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
	// WorkspaceID is optional. If provided, lists internal discussions for that workspace.
	// If empty, lists all public discussions.
	WorkspaceID string
	UserID      string
}

func (u *ListDiscussionsUsecase) Execute(ctx context.Context, input ListDiscussionsInput) ([]DiscussionSummary, error) {
	if input.WorkspaceID == "" {
		return u.qs.ListPublicDiscussions(ctx)
	}

	canAccess, err := u.permSv.CanAccessDiscussion(ctx, input.UserID, input.WorkspaceID, domain.DiscussionStatusInternal)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	return u.qs.ListInternalDiscussions(ctx, input.WorkspaceID)
}
