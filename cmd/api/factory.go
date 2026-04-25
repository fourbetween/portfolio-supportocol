package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/fourbetween/app-supportocol/cmd/api/middleware"
	"github.com/fourbetween/app-supportocol/internal/app"
	"github.com/fourbetween/app-supportocol/internal/dialogue"
	dialogueapi "github.com/fourbetween/app-supportocol/internal/dialogue/api"
	dialogueoas "github.com/fourbetween/app-supportocol/internal/dialogue/api/oas"
	"github.com/fourbetween/app-supportocol/internal/identity"
	identityapi "github.com/fourbetween/app-supportocol/internal/identity/api"
	identityoas "github.com/fourbetween/app-supportocol/internal/identity/api/oas"
	"github.com/fourbetween/app-supportocol/internal/learning"
	learningapi "github.com/fourbetween/app-supportocol/internal/learning/api"
	learningoas "github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpcookie"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/pkg/httperr"
	"github.com/fourbetween/app-supportocol/internal/workspace"
	workspaceapi "github.com/fourbetween/app-supportocol/internal/workspace/api"
	workspaceoas "github.com/fourbetween/app-supportocol/internal/workspace/api/oas"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
)

func NewHTTPHandler(dbCon *sql.DB, appConf conf.Service, awscfg aws.Config) (http.Handler, error) {
	domain, err := appConf.Get("domain")
	if err != nil {
		return nil, fmt.Errorf("failed to get domain from config: %w", err)
	}

	jwtSecret, err := appConf.Get("jwt/secret")
	if err != nil {
		return nil, fmt.Errorf("failed to get JWT secret from config: %w", err)
	}

	jwtSrv, err := jwt.NewDefaultService(jwtSecret, httpcookie.CookieMaxAge)
	if err != nil {
		return nil, fmt.Errorf("failed to create JWT service: %w", err)
	}

	cons, err := app.NewContainers(dbCon, appConf, awscfg, jwtSrv)
	if err != nil {
		return nil, err
	}

	identityHandler, err := newIdentityHandler(jwtSrv, cons.Identity)
	if err != nil {
		return nil, fmt.Errorf("failed to create identity handler: %w", err)
	}

	workspaceHandler, err := newWorkspaceHandler(jwtSrv, cons.Workspace)
	if err != nil {
		return nil, fmt.Errorf("failed to create workspace handler: %w", err)
	}

	learningHandler, err := newLearningHandler(jwtSrv, cons.Learning)
	if err != nil {
		return nil, fmt.Errorf("failed to create learning handler: %w", err)
	}

	dialogueHandler, err := newDialogueHandler(jwtSrv, cons.Dialogue)
	if err != nil {
		return nil, fmt.Errorf("failed to create dialogue handler: %w", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/v1/identity/", identityHandler)
	mux.Handle("/v1/workspace/", workspaceHandler)
	mux.Handle("/v1/learning/", learningHandler)
	mux.Handle("/v1/ai/learning/", learningHandler) // CloudfrontのパスパターンでLambdaを切り替えるため、同じハンドラーを複数のパスに割り当てる
	mux.Handle("/v1/dialogue/", dialogueHandler)

	return middleware.CSRF(domain)(mux), nil
}

func newIdentityHandler(
	jwtSrv jwt.Service,
	con *identity.Container,
) (http.Handler, error) {
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
	jwtSrv jwt.Service,
	con *workspace.Container,
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
	jwtSrv jwt.Service,
	con *learning.Container,
) (http.Handler, error) {
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

func newDialogueHandler(jwtSrv jwt.Service, con *dialogue.Container) (http.Handler, error) {
	server, err := dialogueoas.NewServer(
		dialogueapi.NewHandler(con),
		dialogueapi.NewSecurityHandler(jwtSrv),
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
