package domain

import "github.com/fourbetween/app-supportocol/internal/pkg/apperr"

type DiscussionStatus string

const (
	DiscussionStatusPrivate DiscussionStatus = "private"
	DiscussionStatusPublic  DiscussionStatus = "public"
)

func (s DiscussionStatus) Validate() error {
	switch s {
	case DiscussionStatusPrivate, DiscussionStatusPublic:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}

func (s DiscussionStatus) IsPrivate() bool {
	return s == DiscussionStatusPrivate
}

func (s DiscussionStatus) IsPublic() bool {
	return s == DiscussionStatusPublic
}
