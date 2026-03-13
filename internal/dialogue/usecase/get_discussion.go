package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type GetDiscussionUsecase struct {
	repo   domain.DiscussionRepository
	permSv domain.PermissionService
}

func NewGetDiscussionUsecase(repo domain.DiscussionRepository, permSv domain.PermissionService) *GetDiscussionUsecase {
	return &GetDiscussionUsecase{
		repo:   repo,
		permSv: permSv,
	}
}

type GetDiscussionInput struct {
	ID          string
	WorkspaceID string
	UserID      string
}

type GetDiscussionOutput struct {
	Discussion *domain.Discussion
	ReadCachePolicy
}

func (u *GetDiscussionUsecase) Execute(ctx context.Context, input GetDiscussionInput) (*GetDiscussionOutput, error) {
	discussion, err := u.repo.Load(ctx, domain.LoadDiscussionParams{
		ID:          input.ID,
		WorkspaceID: input.WorkspaceID,
	})
	if err != nil {
		return nil, err
	}

	canAccess, err := u.permSv.CanAccessDiscussion(ctx, input.UserID, input.WorkspaceID, discussion.Status())
	if err != nil {
		return nil, fmt.Errorf("failed to check discussion access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	return &GetDiscussionOutput{
		Discussion:      discussion,
		ReadCachePolicy: ReadCachePolicy{Cacheable: discussion.Status().IsPublic()},
	}, nil
}
