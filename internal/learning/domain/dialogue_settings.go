package domain

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type PermissionLevel string

const (
	PermissionEveryone      PermissionLevel = "everyone"
	PermissionAuthenticated PermissionLevel = "authenticated"
	PermissionNone          PermissionLevel = "none"
)

func (p PermissionLevel) Validate() error {
	switch p {
	case PermissionEveryone, PermissionAuthenticated, PermissionNone:
		return nil
	default:
		return fmt.Errorf("invalid permission level: %s: %w", p, apperr.ErrInvalidArgument)
	}
}

type DialogueSettings struct {
	CommentFrame      CommentFrame
	CommentPermission PermissionLevel
	IssuePermission   PermissionLevel
}

func (s DialogueSettings) Validate() error {
	if err := s.CommentFrame.Validate(); err != nil {
		return err
	}
	if err := s.CommentPermission.Validate(); err != nil {
		return err
	}
	if err := s.IssuePermission.Validate(); err != nil {
		return err
	}
	return nil
}
