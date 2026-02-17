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
	Sort        domain.DiscussionSort
	Paging      domain.Paging
}

type ListDiscussionsOutput struct {
	Items      []DiscussionSummary
	TotalCount int
}

func (u *ListDiscussionsUsecase) Execute(ctx context.Context, input ListDiscussionsInput) (ListDiscussionsOutput, error) {
	if err := input.Sort.Validate(); err != nil {
		return ListDiscussionsOutput{}, err
	}

	if input.WorkspaceID == "" {
		result, err := u.qs.ListPublicDiscussions(ctx, input.Sort, input.Paging)
		if err != nil {
			return ListDiscussionsOutput{}, err
		}
		return ListDiscussionsOutput{Items: result.Items, TotalCount: result.TotalCount}, nil
	}

	canAccess, err := u.permSv.CanAccessDiscussion(ctx, input.UserID, input.WorkspaceID, domain.DiscussionStatusInternal)
	if err != nil {
		return ListDiscussionsOutput{}, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return ListDiscussionsOutput{}, apperr.ErrPermissionDenied
	}

	result, err := u.qs.ListInternalDiscussions(ctx, input.WorkspaceID, input.Sort, input.Paging)
	if err != nil {
		return ListDiscussionsOutput{}, err
	}
	return ListDiscussionsOutput{Items: result.Items, TotalCount: result.TotalCount}, nil
}
