package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/fourbetween/app-supportocol/cmd/api/middleware"
	"github.com/fourbetween/app-supportocol/internal/dialogue"
	dialogueapi "github.com/fourbetween/app-supportocol/internal/dialogue/api"
	dialogueoas "github.com/fourbetween/app-supportocol/internal/dialogue/api/oas"
	"github.com/fourbetween/app-supportocol/internal/identity"
	identityapi "github.com/fourbetween/app-supportocol/internal/identity/api"
	identityoas "github.com/fourbetween/app-supportocol/internal/identity/api/oas"
	identityusecase "github.com/fourbetween/app-supportocol/internal/identity/usecase"
	"github.com/fourbetween/app-supportocol/internal/learning"
	learningapi "github.com/fourbetween/app-supportocol/internal/learning/api"
	learningoas "github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpcookie"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/pkg/httperr"
	"github.com/fourbetween/app-supportocol/internal/workspace"
	workspaceapi "github.com/fourbetween/app-supportocol/internal/workspace/api"
	workspaceoas "github.com/fourbetween/app-supportocol/internal/workspace/api/oas"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
)

func NewHTTPHandler(dbCon *sql.DB, awscfg aws.Config) (http.Handler, error) {
	appConf, err := conf.NewSSMService(env.AppName(), awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to load app config: %w", err)
	}

	domain, err := appConf.Get("domain")
	if err != nil {
		return nil, fmt.Errorf("failed to get domain from config: %w", err)
	}

	jwtSecret, err := appConf.Get("jwt/secret")
	if err != nil {
		return nil, fmt.Errorf("failed to get JWT secret from config: %w", err)
	}

	jwtSrv := jwt.NewDefaultService(jwtSecret, httpcookie.CookieMaxAge)

	workspaceCon, err := workspace.NewAPIContainer(dbCon)
	if err != nil {
		return nil, fmt.Errorf("failed to create workspace api container: %w", err)
	}

	identityHandler, err := newIdentityHandler(dbCon, appConf, jwtSrv, workspaceCon.UserCreatedHandler)
	if err != nil {
		return nil, fmt.Errorf("failed to create identity handler: %w", err)
	}

	workspaceHandler, err := newWorkspaceHandler(workspaceCon, jwtSrv)
	if err != nil {
		return nil, fmt.Errorf("failed to create workspace handler: %w", err)
	}

	learningHandler, err := newLearningHandler(dbCon, appConf, jwtSrv, awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create learning handler: %w", err)
	}

	dialogueHandler, err := newDialogueHandler(dbCon)
	if err != nil {
		return nil, fmt.Errorf("failed to create dialogue handler: %w", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/identity/", identityHandler)
	mux.Handle("/workspace/", workspaceHandler)
	mux.Handle("/learning/", learningHandler)
	mux.Handle("/dialogue/", dialogueHandler)

	return middleware.CSRFMiddleware(domain)(mux), nil
}

func newIdentityHandler(
	dbCon *sql.DB,
	appConf conf.Service,
	jwtSrv jwt.Service,
	userCreatedHandler identityusecase.UserCreatedHandler,
) (http.Handler, error) {
	con, err := identity.NewAPIContainer(dbCon, appConf, jwtSrv, userCreatedHandler)
	if err != nil {
		return nil, fmt.Errorf("failed to create identity api container: %w", err)
	}

	server, err := identityoas.NewServer(
		identityapi.NewHandler(con),
		identityapi.NewSecurityHandler(jwtSrv),
		identityoas.WithErrorHandler(httperr.ErrorHandler),
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

func newWorkspaceHandler(
	con *workspace.APIContainer,
	jwtSrv jwt.Service,
) (http.Handler, error) {
	server, err := workspaceoas.NewServer(
		workspaceapi.NewHandler(con),
		workspaceapi.NewSecurityHandler(jwtSrv),
		workspaceoas.WithErrorHandler(httperr.ErrorHandler),
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

func newLearningHandler(
	dbCon *sql.DB,
	appConf conf.Service,
	jwtSrv jwt.Service,
	awscfg aws.Config,
) (http.Handler, error) {
	con, err := learning.NewAPIContainer(dbCon, appConf, jwtSrv, awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create learning api container: %w", err)
	}

	server, err := learningoas.NewServer(
		learningapi.NewHandler(con),
		learningapi.NewSecurityHandler(jwtSrv),
		learningoas.WithErrorHandler(httperr.ErrorHandler),
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

func newDialogueHandler(dbCon *sql.DB) (http.Handler, error) {
	con, err := dialogue.NewAPIContainer(dbCon)
	if err != nil {
		return nil, fmt.Errorf("failed to create dialogue api container: %w", err)
	}

	server, err := dialogueoas.NewServer(
		dialogueapi.NewHandler(con),
		dialogueoas.WithErrorHandler(httperr.ErrorHandler),
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
