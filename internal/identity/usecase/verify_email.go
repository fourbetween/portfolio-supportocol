package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
)

type VerifyEmailUsecase struct {
	authSrv auth.Service[*domain.User]
}

func NewVerifyEmailUsecase(authSrv auth.Service[*domain.User]) *VerifyEmailUsecase {
	return &VerifyEmailUsecase{
		authSrv: authSrv,
	}
}

func (u *VerifyEmailUsecase) Execute(ctx context.Context, token string) error {
	return u.authSrv.VerifyEmail(ctx, token)
}
