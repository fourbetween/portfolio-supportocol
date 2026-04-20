package middleware

import (
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/pkg/httpcookie"
)

func DevCookie(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := r.Cookie(httpcookie.AuthCookieName); err != nil {
			r = r.Clone(r.Context())
			r.AddCookie(&http.Cookie{
				Name:  httpcookie.AuthCookieName,
				Value: httpcookie.DevDummyToken,
			})
		}
		next.ServeHTTP(w, r)
	})
}
