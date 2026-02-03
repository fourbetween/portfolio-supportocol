package domain

import "github.com/fourbetween/app-supportocol/internal/pkg/apperr"

type IssueStatus string

const (
	IssueStatusOpen   IssueStatus = "open"
	IssueStatusClosed IssueStatus = "closed"
)

func (s IssueStatus) Validate() error {
	switch s {
	case IssueStatusOpen, IssueStatusClosed:
		return nil
	default:
		return apperr.ErrInvalidArgument
	}
}
