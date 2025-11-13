package discussion

import "time"

type (
	// commentStatus はコメントの状態を表す
	commentStatus string

	comment struct {
		ID              string
		DiscussionID    string
		ParentCommentID *string
		CommentTypeID   string
		Content         string
		PostedBy        string
		PostedAt        time.Time
		Status          commentStatus
	}
)

const (
	// commentStatus の定数値
	commentStatusUnassigned commentStatus = "unassigned"
	commentStatusAssigned   commentStatus = "assigned"
	commentStatusArchived   commentStatus = "archived"
	commentStatusDeleted    commentStatus = "deleted"
)
