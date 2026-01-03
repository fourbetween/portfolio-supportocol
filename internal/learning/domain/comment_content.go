package domain

import (
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

const MaxContentLength = 400

type CommentContent struct {
	value string
}

func NewCommentContent(v string) (CommentContent, error) {
	if len([]rune(v)) > MaxContentLength {
		return CommentContent{}, apperr.ErrInvalidRequest
	}
	return CommentContent{value: v}, nil
}

func (c CommentContent) String() string {
	return c.value
}
