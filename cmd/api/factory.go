package api

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/internal/identity"
	"github.com/fourbetween/app-supportocol/internal/learning"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpcookie"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
)

func NewHTTPHandler(dbCon *sql.DB) (http.Handler, error) {
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

	jwtSrv := jwt.NewDefaultService(jwtSecret, httpcookie.CookieMaxAge)

	identityHandler, err := identity.NewHTTPHandler(dbCon, appConf, jwtSrv)
	if err != nil {
		return nil, fmt.Errorf("failed to create identity handler: %w", err)
	}

	learningHandler, err := learning.NewHTTPHandler(dbCon, appConf, jwtSrv)
	if err != nil {
		return nil, fmt.Errorf("failed to create learning handler: %w", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/identity/", identityHandler)
	mux.Handle("/learning/", learningHandler)
	return mux, nil
}
