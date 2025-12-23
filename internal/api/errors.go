package api

import "errors"

var (
	ErrUnauthorized   = errors.New("unauthorized error")
	ErrInvalidRequest = errors.New("invalid request error")
)
