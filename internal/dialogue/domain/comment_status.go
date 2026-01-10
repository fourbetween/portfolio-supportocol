package domain

type CommentStatus string

const (
	CommentStatusActive   CommentStatus = "active"
	CommentStatusProposed CommentStatus = "proposed"
)

func (s CommentStatus) IsValid() bool {
	switch s {
	case CommentStatusActive, CommentStatusProposed:
		return true
	default:
		return false
	}
}
