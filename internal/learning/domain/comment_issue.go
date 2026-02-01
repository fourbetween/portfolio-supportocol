package domain

type CommentIssue struct {
	IssueID string
	Status  CommentIssueStatus
}

type CommentIssueStatus string

const (
	CommentIssueStatusActive   CommentIssueStatus = "active"
	CommentIssueStatusProposed CommentIssueStatus = "proposed"
)
