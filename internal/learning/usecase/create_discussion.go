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
	ProjectID   string
	Theme       string
	Premise     string
	Status      domain.DiscussionStatus
	UserID      string
}

func (u *CreateDiscussionUsecase) Execute(ctx context.Context, input CreateDiscussionInput) (*domain.Discussion, error) {
	canAccess, err := u.permSv.CanAccessProject(ctx, input.UserID, input.WorkspaceID, input.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	isPersonal, err := u.permSv.IsPersonalWorkspace(ctx, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace type: %w", err)
	}
	if input.Status.IsPublic() && !isPersonal {
		return nil, fmt.Errorf("public status is only allowed for personal workspace: %w", apperr.ErrInvalidArgument)
	}
	if input.Status.IsInternal() && isPersonal {
		return nil, fmt.Errorf("internal status is only allowed for organization workspace: %w", apperr.ErrInvalidArgument)
	}

	var discussion *domain.Discussion
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		count, err := u.repo.CountByProjectID(ctx, input.WorkspaceID, input.ProjectID)
		if err != nil {
			return err
		}

		discussion, err = u.fac.Create(domain.CreateDiscussionParams{
			WorkspaceID: input.WorkspaceID,
			ProjectID:   input.ProjectID,
			Theme:       input.Theme,
			Premise:     input.Premise,
			Status:      input.Status,
			CreatedBy:   input.UserID,
		}, count)
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
