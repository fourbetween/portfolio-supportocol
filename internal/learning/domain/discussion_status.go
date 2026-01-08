package domain

type DiscussionStatus string

const (
	DiscussionStatusPrivate DiscussionStatus = "private"
	DiscussionStatusPublic  DiscussionStatus = "public"
)

func (s DiscussionStatus) IsValid() bool {
	switch s {
	case DiscussionStatusPrivate, DiscussionStatusPublic:
		return true
	default:
		return false
	}
}
