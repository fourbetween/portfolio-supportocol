package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
)

type SignupWithEmailUsecase struct {
	authSrv        auth.Service[*domain.User]
	createdHandler UserCreatedHandler
	userRepo       domain.Repository
}

func NewSignupWithEmailUsecase(
	authSrv auth.Service[*domain.User],
	createdHandler UserCreatedHandler,
	userRepo domain.Repository,
) *SignupWithEmailUsecase {
	return &SignupWithEmailUsecase{
		authSrv:        authSrv,
		createdHandler: createdHandler,
		userRepo:       userRepo,
	}
}

func (u *SignupWithEmailUsecase) Execute(ctx context.Context, email, password string) error {
	user, created, err := u.authSrv.SignupWithEmail(ctx, email, password)
	if err != nil {
		return err
	}
	if !created {
		return nil
	}

	if err := u.createdHandler.OnUserCreated(ctx, user.ID()); err != nil {
		if deleteErr := u.userRepo.Delete(ctx, user.ID()); deleteErr != nil {
			return err
		}
		return err
	}

	return nil
}
