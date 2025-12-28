package api

import (
	"database/sql"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/identity/infra/db"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/password"
	"github.com/fourbetween/pkg-conf/conf"
)

type container struct {
	userRepo domain.Repository
	authSrv  auth.Service[*domain.User]
}

func newContainer(dbCon *sql.DB, appConf conf.Service) (*container, error) {
	googleClientID, err := appConf.Get("google/client/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get Google client ID from config: %w", err)
	}

	userFac := domain.NewFactory()
	userRepo := db.NewUserRepository(dbCon)
	userRepo.SetFactory(userFac)

	buildUser := func(p auth.BuildParams) *domain.User {
		return userFac.Build(domain.BuildParams{
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

	return &container{
		userRepo: userRepo,
		authSrv:  authSrv,
	}, nil
}
