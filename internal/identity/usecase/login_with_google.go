package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
)

type LoginWithGoogleUsecase struct {
	authSrv        auth.Service[*domain.User]
	jwtSrv         jwt.Service
	createdHandler UserCreatedHandler
	tx             dbtx.Manager
}

func NewLoginWithGoogleUsecase(
	authSrv auth.Service[*domain.User],
	jwtSrv jwt.Service,
	createdHandler UserCreatedHandler,
	tx dbtx.Manager,
) *LoginWithGoogleUsecase {
	return &LoginWithGoogleUsecase{
		authSrv:        authSrv,
		jwtSrv:         jwtSrv,
		createdHandler: createdHandler,
		tx:             tx,
	}
}

func (u *LoginWithGoogleUsecase) Execute(ctx context.Context, idToken string) (string, error) {
	var token string
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		user, created, err := u.authSrv.LoginWithGoogle(ctx, idToken)
		if err != nil {
			return err
		}

		if created {
			if err := u.createdHandler.OnUserCreated(ctx, user.ID()); err != nil {
				return err
			}
		}

		jwtToken, err := u.jwtSrv.Generate(user.ID())
		if err != nil {
			return err
		}
		token = jwtToken
		return nil
	})
	if err != nil {
		return "", err
	}

	return token, nil
}
