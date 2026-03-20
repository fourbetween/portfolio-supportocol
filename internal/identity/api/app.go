package api

//go:generate go tool ogen -package oas -target oas -clean -config ./schema/ogen.yml ./schema/openapi.yml

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/identity"
	"github.com/fourbetween/app-supportocol/internal/identity/api/oas"
	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpcookie"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/ogen-go/ogen/ogenerrors"
)

type appHandler struct {
	con *identity.Container
}

func NewHandler(con *identity.Container) oas.Handler {
	return &appHandler{
		con: con,
	}
}

func (h *appHandler) V1IdentityErrorsPost(ctx context.Context, req *oas.V1IdentityErrorsPostReq) error {
	slog.Error(
		"frontend error",
		slog.String("message", req.Message),
	)
	return nil
}

func (h *appHandler) V1IdentityGooglePost(ctx context.Context, req *oas.GoogleLoginRequest) error {
	token, err := h.con.LoginWithGoogle.Execute(ctx, req.IdToken)
	if err != nil {
		return err
	}

	h.setAuthCookie(ctx, token)
	return nil
}

func (h *appHandler) V1IdentitySignupPost(ctx context.Context, req *oas.SignupWithEmailRequest) error {
	return h.con.SignupWithEmail.Execute(ctx, req.Email, req.Password)
}

func (h *appHandler) V1IdentityLoginPost(ctx context.Context, req *oas.LoginWithEmailRequest) error {
	token, err := h.con.LoginWithEmail.Execute(ctx, req.Email, req.Password)
	if err != nil {
		return err
	}

	h.setAuthCookie(ctx, token)
	return nil
}

func (h *appHandler) V1IdentityVerifyEmailPost(ctx context.Context, req *oas.VerifyEmailRequest) error {
	token, err := h.con.VerifyEmail.Execute(ctx, req.Token)
	if err != nil {
		return err
	}

	h.setAuthCookie(ctx, token)
	return nil
}

func (h *appHandler) V1IdentityResendVerifyEmailPost(ctx context.Context, req *oas.ResendVerifyEmailRequest) error {
	return h.con.ResendVerifyEmail.Execute(ctx, req.Email)
}

func (h *appHandler) V1IdentityLogoutPost(ctx context.Context) error {
	h.clearAuthCookie(ctx)
	return nil
}

func (h *appHandler) V1IdentityMeGet(ctx context.Context) (*oas.User, error) {
	uid := httpctx.GetUserID(ctx)
	u, err := h.con.GetUser.Execute(ctx, uid)
	if err != nil {
		return nil, err
	}

	res := h.toOasUser(u)
	return &res, nil
}

func (h *appHandler) V1IdentityMeDelete(ctx context.Context) error {
	uid := httpctx.GetUserID(ctx)
	if err := h.con.DeleteUser.Execute(ctx, uid); err != nil {
		return err
	}

	h.clearAuthCookie(ctx)
	return nil
}

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := err.Error()
	if errors.Is(err, apperr.ErrUnauthenticated) ||
		errors.Is(err, auth.ErrNotFound) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) ||
		errors.Is(err, auth.ErrInvalidCredentials) {
		code = 401
	} else if errors.Is(err, apperr.ErrPermissionDenied) ||
		errors.Is(err, auth.ErrEmailNotVerified) {
		code = 403
	} else if errors.Is(err, apperr.ErrNotFound) {
		code = 404
	} else if errors.Is(err, apperr.ErrAlreadyExists) ||
		errors.Is(err, auth.ErrEmailAlreadyExists) {
		code = 409
	} else if errors.Is(err, auth.ErrInvalidToken) ||
		errors.Is(err, auth.ErrInvalidPassword) {
		code = 400
	} else if code == 500 {
		slog.Error(err.Error())
		msg = "internal server error"
	}
	return &oas.ErrorStatusCode{
		StatusCode: code,
		Response: oas.Error{
			Code:    code,
			Message: msg,
		},
	}
}

func (h *appHandler) setAuthCookie(ctx context.Context, token string) {
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
}

func (h *appHandler) clearAuthCookie(ctx context.Context) {
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
}

func (h *appHandler) toOasUser(u *domain.User) oas.User {
	return oas.User{
		ID:    u.ID(),
		Email: u.Email(),
		Name:  u.Name(),
	}
}
