package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type DeleteDiscussionUsecase struct {
	repo   domain.DiscussionRepository
	permSv domain.PermissionService
	tx     dbtx.Manager
}

func NewDeleteDiscussionUsecase(repo domain.DiscussionRepository, permSv domain.PermissionService, tx dbtx.Manager) *DeleteDiscussionUsecase {
	return &DeleteDiscussionUsecase{
		repo:   repo,
		permSv: permSv,
		tx:     tx,
	}
}

type DeleteDiscussionInput struct {
	ID          string
	WorkspaceID string
	UserID      string
}

func (u *DeleteDiscussionUsecase) Execute(ctx context.Context, input DeleteDiscussionInput) error {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return apperr.ErrPermissionDenied
	}

	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		discussion, err := u.repo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.ID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		if discussion.CreatedBy() != input.UserID && !access.CanManage {
			return apperr.ErrPermissionDenied
		}

		return u.repo.Delete(ctx, discussion)
	})
}
