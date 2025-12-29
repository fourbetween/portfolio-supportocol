package middleware

import (
	"net/http"
)

// NewCSRFMiddleware creates a CSRF protection middleware using Go 1.25's CrossOriginProtection.
func CSRFMiddleware(domain string) func(http.Handler) http.Handler {
	cop := http.NewCrossOriginProtection()
	cop.AddTrustedOrigin("https://" + domain)
	return func(next http.Handler) http.Handler {
		return cop.Handler(next)
	}
}
