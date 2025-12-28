package api

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/identity/api/oas"
	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpcookie"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/ogen-go/ogen/ogenerrors"
)

type appHandler struct {
	con    *container
	jwtSrv jwt.Service
}

func (h *appHandler) IdentityErrorsPost(ctx context.Context, req *oas.IdentityErrorsPostReq) error {
	slog.Error(
		"frontend error",
		slog.String("message", req.Message),
	)
	return nil
}

func (h *appHandler) IdentityGooglePost(ctx context.Context, req *oas.GoogleLoginRequest) error {
	u, err := h.con.authSrv.LoginWithGoogle(ctx, req.IdToken)
	if err != nil {
		return err
	}

	token, err := h.jwtSrv.Generate(u.ID())
	if err != nil {
		return err
	}

	w := httpctx.GetResponseWriter(ctx)
	http.SetCookie(w, &http.Cookie{
		Name:     httpcookie.AuthCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   int(httpcookie.CookieMaxAge.Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	return nil
}

func (h *appHandler) IdentityLogoutPost(ctx context.Context) error {
	w := httpctx.GetResponseWriter(ctx)
	http.SetCookie(w, &http.Cookie{
		Name:     httpcookie.AuthCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	return nil
}

func (h *appHandler) IdentityMeGet(ctx context.Context) (*oas.User, error) {
	u, err := h.loadUser(ctx, h.con)
	if err != nil {
		return nil, err
	}

	res := h.toOasUser(u)
	return &res, nil
}

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := err.Error()
	if errors.Is(err, apperr.ErrUnauthorized) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) {
		code = 401
	}
	if errors.Is(err, apperr.ErrForbidden) {
		code = 403
	}
	if errors.Is(err, apperr.ErrNotFound) {
		code = 404
	}
	if errors.Is(err, apperr.ErrConflict) {
		code = 409
	}
	if code == 500 {
		slog.Error(err.Error())
	}
	return &oas.ErrorStatusCode{
		StatusCode: code,
		Response: oas.Error{
			Code:    code,
			Message: msg,
		},
	}
}

func (h *appHandler) loadUser(ctx context.Context, con *container) (*domain.User, error) {
	uid := httpctx.GetUserID(ctx)
	if uid == "" {
		return nil, apperr.ErrUnauthorized
	}
	return con.userRepo.FindByID(ctx, uid)
}

func (h *appHandler) toOasUser(u *domain.User) oas.User {
	return oas.User{
		ID:    u.ID(),
		Email: u.Email(),
		Name:  u.Name(),
	}
}
