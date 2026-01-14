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

func (s DiscussionStatus) IsPrivate() bool {
	return s == DiscussionStatusPrivate
}

func (s DiscussionStatus) IsPublic() bool {
	return s == DiscussionStatusPublic
}
