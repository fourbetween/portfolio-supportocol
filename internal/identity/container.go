package identity

import (
	"database/sql"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/identity/infra/db"
	"github.com/fourbetween/app-supportocol/internal/identity/usecase"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-auth/password"
	"github.com/fourbetween/pkg-conf/conf"
)

type APIContainer struct {
	LoginWithGoogle *usecase.LoginWithGoogleUsecase
	GetUser         *usecase.GetUserUsecase
}

func NewAPIContainer(dbCon *sql.DB, appConf conf.Service, jwtSrv jwt.Service) (*APIContainer, error) {
	googleClientID, err := appConf.Get("google/client/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get Google client ID from config: %w", err)
	}

	userFac := domain.NewFactory()
	userRepo := db.NewUserRepository(dbCon, userFac)

	buildUser := func(p auth.BuildParams) *domain.User {
		return userFac.Reconstruct(domain.ReconstructParams{
			ID:                          p.ID,
			Email:                       p.Email,
			Name:                        p.Name,
			PasswordHash:                p.PasswordHash,
			GoogleSub:                   p.GoogleSub,
			EmailVerifiedAt:             p.EmailVerifiedAt,
			EmailVerifyTokenHash:        p.EmailVerifyTokenHash,
			EmailVerifyTokenExpiresAt:   p.EmailVerifyTokenExpiresAt,
			PasswordResetTokenHash:      p.PasswordResetTokenHash,
			PasswordResetTokenExpiresAt: p.PasswordResetTokenExpiresAt,
		})
	}

	authSrv := auth.NewDefaultService(
		password.NewDefaultService(),
		nil,
		userRepo,
		buildUser,
		googleClientID,
	)

	return &APIContainer{
		LoginWithGoogle: usecase.NewLoginWithGoogleUsecase(authSrv, jwtSrv),
		GetUser:         usecase.NewGetUserUsecase(userRepo),
	}, nil
}
