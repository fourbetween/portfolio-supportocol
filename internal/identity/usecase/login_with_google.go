package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
)

type LoginWithGoogleUsecase struct {
	authSrv auth.Service[*domain.User]
	jwtSrv  jwt.Service
}

func NewLoginWithGoogleUsecase(
	authSrv auth.Service[*domain.User],
	jwtSrv jwt.Service,
) *LoginWithGoogleUsecase {
	return &LoginWithGoogleUsecase{
		authSrv: authSrv,
		jwtSrv:  jwtSrv,
	}
}

func (u *LoginWithGoogleUsecase) Execute(ctx context.Context, idToken string) (string, error) {
	user, _, err := u.authSrv.LoginWithGoogle(ctx, idToken)
	if err != nil {
		return "", err
	}
	return u.jwtSrv.Generate(user.ID())
}
