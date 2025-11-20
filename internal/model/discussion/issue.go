package discussion

import "time"

type (
	// issueType は指摘の種類を表す
	issueType string

	Issue struct {
		ID          string
		CommentID   string
		IssueType   issueType
		Description string
		CreatedBy   string
		CreatedAt   time.Time
	}
)

const (
	// issueType の定数値
	issueTypeContradiction issueType = "contradiction"  // 矛盾
	issueTypeCircularLogic issueType = "circular_logic" // 循環論法
)
