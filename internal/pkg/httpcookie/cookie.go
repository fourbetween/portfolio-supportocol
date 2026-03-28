package httpcookie

import (
	"context"
	"net/http"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
)

const (
	AuthCookieName = "auth_token"
	CookieMaxAge   = 30 * 24 * time.Hour
)

func SetAuthCookie(ctx context.Context, token string) {
	w := httpctx.GetResponseWriter(ctx)
	if w == nil {
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     AuthCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   int(CookieMaxAge.Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func ClearAuthCookie(ctx context.Context) {
	w := httpctx.GetResponseWriter(ctx)
	if w == nil {
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     AuthCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}
