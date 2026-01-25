package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type CreateDiscussionUsecase struct {
	repo   domain.DiscussionRepository
	fac    *domain.DiscussionFactory
	permSv domain.PermissionService
	tx     dbtx.Manager
}

func NewCreateDiscussionUsecase(
	repo domain.DiscussionRepository,
	fac *domain.DiscussionFactory,
	permSv domain.PermissionService,
	tx dbtx.Manager,
) *CreateDiscussionUsecase {
	return &CreateDiscussionUsecase{
		repo:   repo,
		fac:    fac,
		permSv: permSv,
		tx:     tx,
	}
}

type CreateDiscussionInput struct {
	WorkspaceID string
	Theme       string
	Status      domain.DiscussionStatus
	UserID      string
}

func (u *CreateDiscussionUsecase) Execute(ctx context.Context, input CreateDiscussionInput) (*domain.Discussion, error) {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	var discussion *domain.Discussion
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		var err error
		discussion, err = u.fac.Create(domain.CreateDiscussionParams{
			WorkspaceID: input.WorkspaceID,
			Theme:       input.Theme,
			Status:      input.Status,
			CreatedBy:   input.UserID,
		})
		if err != nil {
			return err
		}

		if err := u.repo.Save(ctx, discussion); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return discussion, nil
}
