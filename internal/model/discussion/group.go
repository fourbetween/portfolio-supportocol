package discussion

import "time"

type (
	group struct {
		ID          string
		Name        string
		Description string
		CreatedBy   string
		CreatedAt   time.Time
	}

	groupMember struct {
		GroupID  string
		UserID   string
		JoinedAt time.Time
	}
)
