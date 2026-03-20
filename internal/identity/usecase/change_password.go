package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
)

type ChangePasswordUsecase struct {
	authSrv auth.Service[*domain.User]
}

func NewChangePasswordUsecase(authSrv auth.Service[*domain.User]) *ChangePasswordUsecase {
	return &ChangePasswordUsecase{authSrv: authSrv}
}

func (u *ChangePasswordUsecase) Execute(ctx context.Context, userID, currentPassword, newPassword string) error {
	return u.authSrv.ChangePassword(ctx, userID, currentPassword, newPassword)
}
