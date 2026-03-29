package middleware

import (
	"net/http"
)

func CSRF(domain string) func(http.Handler) http.Handler {
	cop := http.NewCrossOriginProtection()
	cop.AddTrustedOrigin("https://" + domain)
	return func(next http.Handler) http.Handler {
		return cop.Handler(next)
	}
}
