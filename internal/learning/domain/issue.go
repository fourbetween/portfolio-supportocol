package domain

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type Issue struct {
	id          string
	issueType   string
	description string
	status      IssueStatus
}

func (i *Issue) ID() string {
	return i.id
}

func (i *Issue) IssueType() string {
	return i.issueType
}

func (i *Issue) Description() string {
	return i.description
}

func (i *Issue) Status() IssueStatus {
	return i.status
}

func (i *Issue) Validate() error {
	if i.id == "" {
		return fmt.Errorf("%w: issue id is required", apperr.ErrInvalidArgument)
	}
	if i.issueType == "" {
		return fmt.Errorf("%w: issue type is required", apperr.ErrInvalidArgument)
	}
	if i.description == "" {
		return fmt.Errorf("%w: issue description is required", apperr.ErrInvalidArgument)
	}
	if err := i.status.Validate(); err != nil {
		return fmt.Errorf("%w: invalid issue status: %s", err, i.status)
	}
	return nil
}
