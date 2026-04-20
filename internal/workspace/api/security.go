package api

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpcookie"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/workspace/api/oas"
	"github.com/fourbetween/pkg-auth/jwt"
)

type (
	securityHandler struct {
		jwtSrv jwt.Service
	}
)

func NewSecurityHandler(jwtSrv jwt.Service) *securityHandler {
	return &securityHandler{
		jwtSrv: jwtSrv,
	}
}

func (h *securityHandler) HandleCookieAuth(
	ctx context.Context,
	operationName string,
	t oas.CookieAuth,
) (context.Context, error) {
	if env.IsDev() && t.APIKey == httpcookie.DevDummyToken {
		if userID := env.DevUserID(); userID != "" {
			return httpctx.WithUserID(ctx, userID), nil
		}
	}

	if t.APIKey == "" {
		return ctx, apperr.ErrUnauthenticated
	}

	userID, err := h.jwtSrv.Parse(t.APIKey)
	if err != nil || userID == "" {
		return ctx, apperr.ErrUnauthenticated
	}

	return httpctx.WithUserID(ctx, userID), nil
}
