package apperr

import (
	"errors"
)

var (
	ErrForbidden      = errors.New("forbidden error")
	ErrNotFound       = errors.New("not found error")
	ErrConflict       = errors.New("conflict error")
	ErrUnauthorized   = errors.New("unauthorized error")
	ErrInvalidRequest = errors.New("invalid request error")
)
