package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
)

type ConfirmPasswordResetUsecase struct {
	authSrv auth.Service[*domain.User]
}

func NewConfirmPasswordResetUsecase(authSrv auth.Service[*domain.User]) *ConfirmPasswordResetUsecase {
	return &ConfirmPasswordResetUsecase{authSrv: authSrv}
}

func (u *ConfirmPasswordResetUsecase) Execute(ctx context.Context, token, newPassword string) error {
	return u.authSrv.ConfirmPasswordReset(ctx, token, newPassword)
}
