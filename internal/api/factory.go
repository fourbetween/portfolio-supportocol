package api

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/internal/api/middleware/csrf"
	"github.com/fourbetween/app-supportocol/internal/api/oas"
	"github.com/fourbetween/app-supportocol/internal/service/env"
	"github.com/fourbetween/pkg-auth/jwt"
	conf "github.com/fourbetween/pkg-conf"
	uow "github.com/fourbetween/pkg-uow"
)

func NewHttpHandler(dbCon *sql.DB) (http.Handler, error) {
	awscfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, fmt.Errorf("failed to load aws config for ses: %w", err)
	}

	appConf, err := conf.NewSSMService(env.AppName(), awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to load app config: %w", err)
	}

	jwtSecret, err := appConf.Get("jwt/secret")
	if err != nil {
		return nil, fmt.Errorf("failed to get JWT secret from config: %w", err)
	}

	jwtSrv := jwt.NewDefaultService(jwtSecret, cookieMaxAge)

	domain, err := appConf.Get("domain")
	if err != nil {
		return nil, fmt.Errorf("failed to get allowed origin from config: %w", err)
	}

	containerFac, err := newContainerFactory(appConf, jwtSrv)
	if err != nil {
		return nil, fmt.Errorf("failed to create container factory: %w", err)
	}

	uowSrv := uow.NewSqlUnitOfWork(dbCon, containerFac)

	app := &appHandler{
		uowSrv: uowSrv,
		jwtSrv: jwtSrv,
	}
	sec := NewSecurityHandler(jwtSrv)
	server, err := oas.NewServer(app, sec, oas.WithErrorHandler(errorHandler))
	if err != nil {
		return nil, err
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := withResponseWriter(r.Context(), w)
		server.ServeHTTP(w, r.WithContext(ctx))
	})

	// Wrap with CSRF middleware
	return csrf.NewMiddleware(domain)(handler), nil
}
