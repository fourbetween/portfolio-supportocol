package domain

import "github.com/fourbetween/app-supportocol/internal/pkg/apperr"

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

func (s CommentIssueStatus) Validate() error {
	switch s {
	case CommentIssueStatusActive, CommentIssueStatusProposed:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}
