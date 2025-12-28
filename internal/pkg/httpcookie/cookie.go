package httpcookie

import "time"

const (
	AuthCookieName = "auth_token"
	CookieMaxAge   = 30 * 24 * time.Hour
)
