package discussion

import "time"

type (
	// CommentStatus はコメントの状態を表す
	CommentStatus string

	Comment struct {
		ID              string
		DiscussionID    string
		ParentCommentID *string
		CommentTypeID   string
		Content         string
		PostedBy        string
		PostedAt        time.Time
		Status          CommentStatus
	}
)

const (
	// CommentStatus の定数値
	CommentStatusUnassigned CommentStatus = "unassigned"
	CommentStatusAssigned   CommentStatus = "assigned"
	CommentStatusArchived   CommentStatus = "archived"
	CommentStatusDeleted    CommentStatus = "deleted"
)
