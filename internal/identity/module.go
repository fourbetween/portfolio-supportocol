package identity

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/identity/api"
	"github.com/fourbetween/app-supportocol/internal/identity/api/oas"
	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/identity/infra/db"
	"github.com/fourbetween/app-supportocol/internal/identity/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/pkg/httperr"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-auth/password"
	"github.com/fourbetween/pkg-conf/conf"
)

func NewHTTPHandler(dbCon *sql.DB, appConf conf.Service, jwtSrv jwt.Service) (http.Handler, error) {
	googleClientID, err := appConf.Get("google/client/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get Google client ID from config: %w", err)
	}

	userFac := domain.NewFactory()
	userRepo := db.NewUserRepository(dbCon)
	userRepo.SetFactory(userFac)

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

	server, err := oas.NewServer(
		api.NewHandler(api.HandlerParams{
			LoginWithGoogle: usecase.NewLoginWithGoogleUsecase(authSrv, jwtSrv),
			GetUser:         usecase.NewGetUserUsecase(userRepo),
		}),
		api.NewSecurityHandler(jwtSrv),
		oas.WithErrorHandler(httperr.ErrorHandler),
	)
	if err != nil {
		return nil, err
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := httpctx.WithResponseWriter(r.Context(), w)
		server.ServeHTTP(w, r.WithContext(ctx))
	})

	return handler, nil
}
