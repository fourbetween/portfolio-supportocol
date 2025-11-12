package api

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/api/oas"
	auth "github.com/fourbetween/pkg-auth"
)

type (
	securityHandler struct {
		authSrv auth.Auth
	}

	userCtxKey struct{}
)

func (h *securityHandler) HandleCognitoAuth(
	ctx context.Context,
	operationName string,
	t oas.CognitoAuth,
) (context.Context, error) {
	u, err := h.authSrv.UserFromToken(ctx, t.Token)
	if err != nil {
		return ctx, fmt.Errorf("failed to get user: %w", err)
	}
	return context.WithValue(ctx, userCtxKey{}, u), nil
}

func userFromContext(ctx context.Context) *auth.User {
	u, _ := ctx.Value(userCtxKey{}).(*auth.User)
	return u
}
