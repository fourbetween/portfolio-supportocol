package domain

type IssueStatus string

const (
	IssueStatusOpen   IssueStatus = "open"
	IssueStatusClosed IssueStatus = "closed"
)
