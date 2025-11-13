package discussion

import "time"

type (
	rule struct {
		ID          string
		Name        string
		Description string
		CreatedBy   string
		CreatedAt   time.Time
	}

	commentType struct {
		ID          string
		RuleID      string
		Name        string
		Description string
	}

	commentTypePath struct {
		ID                string
		RuleID            string
		FromCommentTypeID string
		ToCommentTypeID   string
	}
)
