package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type DeleteUserUsecase struct {
	userRepo       domain.Repository
	deletedHandler UserDeletedHandler
	tx             dbtx.Manager
}

func NewDeleteUserUsecase(
	userRepo domain.Repository,
	deletedHandler UserDeletedHandler,
	tx dbtx.Manager,
) *DeleteUserUsecase {
	return &DeleteUserUsecase{
		userRepo:       userRepo,
		deletedHandler: deletedHandler,
		tx:             tx,
	}
}

func (u *DeleteUserUsecase) Execute(ctx context.Context, userID string) error {
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		user, err := u.userRepo.FindByID(ctx, userID)
		if err != nil {
			return err
		}

		if err := u.deletedHandler.OnUserDeleted(ctx, userID); err != nil {
			return err
		}

		return u.userRepo.Delete(ctx, user.ID())
	})
}
