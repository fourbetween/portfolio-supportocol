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
}

func (u *GetDiscussionUsecase) Execute(ctx context.Context, input GetDiscussionInput) (*domain.Discussion, error) {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	return u.repo.Load(ctx, domain.LoadDiscussionParams{
		ID:          input.ID,
		WorkspaceID: input.WorkspaceID,
	})
}
