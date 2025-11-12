package internal

import (
	"errors"
)

var (
	ErrForbidden = errors.New("forbidden error")
	ErrNotFound  = errors.New("not found error")
	ErrConflict  = errors.New("conflict error")
)
