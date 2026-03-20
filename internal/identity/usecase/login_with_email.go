package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
)

type LoginWithEmailUsecase struct {
	authSrv auth.Service[*domain.User]
	jwtSrv  jwt.Service
}

func NewLoginWithEmailUsecase(
	authSrv auth.Service[*domain.User],
	jwtSrv jwt.Service,
) *LoginWithEmailUsecase {
	return &LoginWithEmailUsecase{
		authSrv: authSrv,
		jwtSrv:  jwtSrv,
	}
}

func (u *LoginWithEmailUsecase) Execute(ctx context.Context, email, password string) (string, error) {
	user, err := u.authSrv.LoginWithEmail(ctx, email, password)
	if err != nil {
		return "", err
	}

	token, err := u.jwtSrv.Generate(user.ID())
	if err != nil {
		return "", err
	}

	return token, nil
}
