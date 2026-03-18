package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/pkg-auth/auth"
)

type SignupWithEmailUsecase struct {
	authSrv        auth.Service[*domain.User]
	createdHandler UserCreatedHandler
	tx             dbtx.Manager
}

func NewSignupWithEmailUsecase(
	authSrv auth.Service[*domain.User],
	createdHandler UserCreatedHandler,
	tx dbtx.Manager,
) *SignupWithEmailUsecase {
	return &SignupWithEmailUsecase{
		authSrv:        authSrv,
		createdHandler: createdHandler,
		tx:             tx,
	}
}

func (u *SignupWithEmailUsecase) Execute(ctx context.Context, email, password string) error {
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		user, created, err := u.authSrv.SignupWithEmail(ctx, email, password)
		if err != nil {
			return err
		}

		if created {
			if err := u.createdHandler.OnUserCreated(ctx, user.ID()); err != nil {
				return err
			}
		}

		return nil
	})
}
