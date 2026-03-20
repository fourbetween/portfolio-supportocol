package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
)

type ResendVerifyEmailUsecase struct {
	authSrv auth.Service[*domain.User]
}

func NewResendVerifyEmailUsecase(authSrv auth.Service[*domain.User]) *ResendVerifyEmailUsecase {
	return &ResendVerifyEmailUsecase{
		authSrv: authSrv,
	}
}

func (u *ResendVerifyEmailUsecase) Execute(ctx context.Context, email string) error {
	return u.authSrv.ResendVerifyEmail(ctx, email)
}
