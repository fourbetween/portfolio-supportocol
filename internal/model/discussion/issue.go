package discussion

import "time"

type (
	issue struct {
		ID          string
		CommentID   string
		IssueType   string
		Description string
		CreatedBy   string
		CreatedAt   time.Time
	}
)
