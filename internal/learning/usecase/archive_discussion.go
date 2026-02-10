package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type ArchiveDiscussionUsecase struct {
	repo   domain.DiscussionRepository
	permSv domain.PermissionService
	tx     dbtx.Manager
	clock  clock.Service
}

func NewArchiveDiscussionUsecase(repo domain.DiscussionRepository, permSv domain.PermissionService, tx dbtx.Manager, clock clock.Service) *ArchiveDiscussionUsecase {
	return &ArchiveDiscussionUsecase{
		repo:   repo,
		permSv: permSv,
		tx:     tx,
		clock:  clock,
	}
}

type ArchiveDiscussionInput struct {
	ID          string
	WorkspaceID string
	UserID      string
}

func (u *ArchiveDiscussionUsecase) Execute(ctx context.Context, input ArchiveDiscussionInput) (*domain.Discussion, error) {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return nil, apperr.ErrPermissionDenied
	}

	var discussion *domain.Discussion
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		var err error
		discussion, err = u.repo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.ID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		if !discussion.IsCreatedBy(input.UserID) && !access.CanManage {
			return apperr.ErrPermissionDenied
		}

		if err := discussion.Archive(u.clock.Now()); err != nil {
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
