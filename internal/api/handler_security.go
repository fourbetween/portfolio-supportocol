package api

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/api/oas"
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
		return ctx, ErrUnauthorized
	}

	userID, err := h.jwtSrv.Parse(t.APIKey)
	if err != nil {
		return ctx, ErrUnauthorized
	}

	return withUserID(ctx, userID), nil
}
