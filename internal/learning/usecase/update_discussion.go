package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateDiscussionUsecase struct {
	repo   domain.DiscussionRepository
	permSv domain.PermissionService
	tx     dbtx.Manager
}

func NewUpdateDiscussionUsecase(repo domain.DiscussionRepository, permSv domain.PermissionService, tx dbtx.Manager) *UpdateDiscussionUsecase {
	return &UpdateDiscussionUsecase{
		repo:   repo,
		permSv: permSv,
		tx:     tx,
	}
}

type UpdateDiscussionInput struct {
	ID          string
	WorkspaceID string
	UserID      string
	Theme       string
	Premise     string
	Conclusion  string
}

func (u *UpdateDiscussionUsecase) Execute(ctx context.Context, input UpdateDiscussionInput) (*domain.Discussion, error) {
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
		discussion, err = u.repo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.ID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		if err := discussion.Update(domain.UpdateParams{
			Theme:      input.Theme,
			Premise:    input.Premise,
			Conclusion: input.Conclusion,
		}); err != nil {
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
