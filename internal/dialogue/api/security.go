package api

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/dialogue/api/oas"
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

// HandleCookieAuth handles optional cookie authentication.
// Unlike the learning context, dialogue allows unauthenticated access,
// so it returns the context without error when the token is missing or invalid.
func (h *securityHandler) HandleCookieAuth(
	ctx context.Context,
	operationName string,
	t oas.CookieAuth,
) (context.Context, error) {
	if t.APIKey == "" {
		return ctx, nil
	}

	userID, err := h.jwtSrv.Parse(t.APIKey)
	if err != nil || userID == "" {
		return ctx, nil
	}

	return httpctx.WithUserID(ctx, userID), nil
}
