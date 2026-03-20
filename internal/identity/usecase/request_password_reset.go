package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
)

type RequestPasswordResetUsecase struct {
	authSrv auth.Service[*domain.User]
}

func NewRequestPasswordResetUsecase(authSrv auth.Service[*domain.User]) *RequestPasswordResetUsecase {
	return &RequestPasswordResetUsecase{authSrv: authSrv}
}

func (u *RequestPasswordResetUsecase) Execute(ctx context.Context, email string) error {
	return u.authSrv.RequestPasswordReset(ctx, email)
}
