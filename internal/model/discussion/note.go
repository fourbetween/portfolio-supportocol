package discussion

import "time"

type (
	Note struct {
		ID           string
		DiscussionID string
		Content      string
		PostedBy     string
		PostedAt     time.Time
	}
)
