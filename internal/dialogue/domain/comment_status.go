package domain

import "github.com/fourbetween/app-supportocol/internal/pkg/apperr"

type CommentStatus string

const (
	CommentStatusActive   CommentStatus = "active"
	CommentStatusProposed CommentStatus = "proposed"
)

func (s CommentStatus) Validate() error {
	switch s {
	case CommentStatusActive, CommentStatusProposed:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}
