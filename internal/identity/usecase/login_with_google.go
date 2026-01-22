package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
)

type LoginWithGoogleUsecase struct {
	authSrv        auth.Service[*domain.User]
	jwtSrv         jwt.Service
	createdHandler UserCreatedHandler
}

func NewLoginWithGoogleUsecase(
	authSrv auth.Service[*domain.User],
	jwtSrv jwt.Service,
	createdHandler UserCreatedHandler,
) *LoginWithGoogleUsecase {
	return &LoginWithGoogleUsecase{
		authSrv:        authSrv,
		jwtSrv:         jwtSrv,
		createdHandler: createdHandler,
	}
}

func (u *LoginWithGoogleUsecase) Execute(ctx context.Context, idToken string) (string, error) {
	user, created, err := u.authSrv.LoginWithGoogle(ctx, idToken)
	if err != nil {
		return "", err
	}

	if created {
		if err := u.createdHandler.OnUserCreated(ctx, user.ID()); err != nil {
			return "", err
		}
	}

	return u.jwtSrv.Generate(user.ID())
}
