package handler

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
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
	if t.APIKey == "" {
		return ctx, apperr.ErrUnauthorized
	}

	userID, err := h.jwtSrv.Parse(t.APIKey)
	if err != nil {
		return ctx, apperr.ErrUnauthorized
	}

	return httpctx.WithUserID(ctx, userID), nil
}
