package domain

type CommentIssue struct {
	IssueID   string
	Status    CommentIssueStatus
	CreatedBy *string
}

type CommentIssueStatus string

const (
	CommentIssueStatusActive   CommentIssueStatus = "active"
	CommentIssueStatusProposed CommentIssueStatus = "proposed"
)
