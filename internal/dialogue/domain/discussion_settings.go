package domain

import (
	"fmt"
	"slices"

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

// CanPerform checks if the given userID is allowed to perform an action based on the permission level.
func (p PermissionLevel) CanPerform(userID string) bool {
	switch p {
	case PermissionEveryone:
		return true
	case PermissionAuthenticated:
		return userID != ""
	case PermissionNone:
		return false
	default:
		return false
	}
}

type DiscussionSettings struct {
	CommentFrame      CommentFrame
	CommentPermission PermissionLevel
	IssuePermission   PermissionLevel
}

type CommentFrame struct {
	Types []string
	Paths []CommentPath
}

type CommentPath struct {
	Child  string
	Parent string
}

func (cf CommentFrame) ValidateComment(commentType string, parentType *string) error {
	if !slices.Contains(cf.Types, commentType) {
		return fmt.Errorf("invalid comment type: %s: %w", commentType, apperr.ErrInvalidArgument)
	}

	parent := ""
	if parentType != nil {
		parent = *parentType
	}

	pathAllowed := false
	for _, p := range cf.Paths {
		if p.Child == commentType && p.Parent == parent {
			pathAllowed = true
			break
		}
	}
	if !pathAllowed {
		return fmt.Errorf("invalid comment path: %s <- %s: %w", commentType, parent, apperr.ErrInvalidArgument)
	}
	return nil
}
