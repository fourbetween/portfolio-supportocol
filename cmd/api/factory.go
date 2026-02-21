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
	dialogueadapter "github.com/fourbetween/app-supportocol/internal/dialogue/infra/adapter"
	dialoguedb "github.com/fourbetween/app-supportocol/internal/dialogue/infra/db"
	"github.com/fourbetween/app-supportocol/internal/identity"
	identityapi "github.com/fourbetween/app-supportocol/internal/identity/api"
	identityoas "github.com/fourbetween/app-supportocol/internal/identity/api/oas"
	identityusecase "github.com/fourbetween/app-supportocol/internal/identity/usecase"
	"github.com/fourbetween/app-supportocol/internal/learning"
	learningapi "github.com/fourbetween/app-supportocol/internal/learning/api"
	learningoas "github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	learningadapter "github.com/fourbetween/app-supportocol/internal/learning/infra/adapter"
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

	dialogueFavSvc := dialoguedb.NewDiscussionFavoritesService(dbCon)

	workspaceCon, err := workspace.NewAPIContainer(dbCon, dialogueFavSvc)
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

	learningPermSv := learningadapter.NewWorkspacePermissionAdapter(workspaceCon.WorkspaceQueryService)
	learningAIUsageSv := learningadapter.NewAIUsageAdapter(workspaceCon.AIUsageService)
	learningHandler, err := newLearningHandler(dbCon, appConf, jwtSrv, awscfg, learningPermSv, learningAIUsageSv)
	if err != nil {
		return nil, fmt.Errorf("failed to create learning handler: %w", err)
	}

	dialoguePermSv := dialogueadapter.NewWorkspacePermissionAdapter(workspaceCon.WorkspaceQueryService)
	dialogueHandler, err := newDialogueHandler(dbCon, jwtSrv, dialoguePermSv)
	if err != nil {
		return nil, fmt.Errorf("failed to create dialogue handler: %w", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/v1/identity/", identityHandler)
	mux.Handle("/v1/workspace/", workspaceHandler)
	mux.Handle("/v1/learning/", learningHandler)
	mux.Handle("/v1/dialogue/", dialogueHandler)

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
	permSv *learningadapter.WorkspacePermissionAdapter,
	aiUsageSv *learningadapter.AIUsageAdapter,
) (http.Handler, error) {
	con, err := learning.NewAPIContainer(dbCon, appConf, awscfg, permSv, aiUsageSv)
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

func newDialogueHandler(dbCon *sql.DB, jwtSrv jwt.Service, permSv *dialogueadapter.WorkspacePermissionAdapter) (http.Handler, error) {
	con, err := dialogue.NewAPIContainer(dbCon, permSv)
	if err != nil {
		return nil, fmt.Errorf("failed to create dialogue api container: %w", err)
	}

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
