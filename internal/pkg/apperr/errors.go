package apperr

import (
	"errors"
)

var (
	ErrPermissionDenied = errors.New("permission denied error")
	ErrNotFound         = errors.New("not found error")
	ErrAlreadyExists    = errors.New("already exists error")
	ErrUnauthenticated  = errors.New("unauthenticated error")
	ErrInvalidArgument  = errors.New("invalid argument error")
	ErrLimitExceeded    = errors.New("limit exceeded error")
)
