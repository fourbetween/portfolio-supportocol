package discussion

import "time"

type (
	// IssueType は指摘の種類を表す
	IssueType string

	Issue struct {
		ID          string
		CommentID   string
		IssueType   IssueType
		Description string
		CreatedBy   string
		CreatedAt   time.Time
	}
)

const (
	// IssueType の定数値
	IssueTypeContradiction IssueType = "contradiction"  // 矛盾
	IssueTypeCircularLogic IssueType = "circular_logic" // 循環論法
)
