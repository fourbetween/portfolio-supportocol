package domain

import (
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

const MaxThemeLength = 255

type DiscussionTheme struct {
	value string
}

func NewDiscussionTheme(v string) (DiscussionTheme, error) {
	if len([]rune(v)) > MaxThemeLength {
		return DiscussionTheme{}, apperr.ErrInvalidArgument
	}
	return DiscussionTheme{value: v}, nil
}

func (t DiscussionTheme) String() string {
	return t.value
}
