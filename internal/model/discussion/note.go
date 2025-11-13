package discussion

import "time"

type (
	note struct {
		ID           string
		DiscussionID string
		Content      string
		PostedBy     string
		PostedAt     time.Time
	}
)
