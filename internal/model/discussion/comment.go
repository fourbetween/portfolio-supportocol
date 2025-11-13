package discussion

import "time"

type (
	comment struct {
		ID              string
		DiscussionID    string
		ParentCommentID *string
		CommentTypeID   string
		Content         string
		PostedBy        string
		PostedAt        time.Time
		Status          string
	}
)
