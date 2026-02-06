package domain

import "github.com/fourbetween/app-supportocol/internal/pkg/apperr"

type DiscussionStatus string

const (
	DiscussionStatusPublic   DiscussionStatus = "public"
	DiscussionStatusInternal DiscussionStatus = "internal"
)

func (s DiscussionStatus) Validate() error {
	switch s {
	case DiscussionStatusPublic, DiscussionStatusInternal:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}

func (s DiscussionStatus) IsPublic() bool {
	return s == DiscussionStatusPublic
}

func (s DiscussionStatus) IsInternal() bool {
	return s == DiscussionStatusInternal
}
