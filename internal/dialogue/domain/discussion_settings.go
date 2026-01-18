package domain

import (
	"fmt"
	"slices"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type DiscussionSettings struct {
	CommentFrame CommentFrame
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
