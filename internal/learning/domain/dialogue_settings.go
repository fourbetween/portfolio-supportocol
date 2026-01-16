package domain

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type DialogueSettings struct {
	DiscussionID string
	CommentFrame CommentFrame
}

func (s DialogueSettings) Validate() error {
	if s.DiscussionID == "" {
		return fmt.Errorf("discussion id must not be empty: %w", apperr.ErrInvalidArgument)
	}
	if err := s.CommentFrame.Validate(); err != nil {
		return err
	}
	return nil
}

type CommentFrame struct {
	Types []string
	Paths []CommentPath
}

func (cf CommentFrame) Validate() error {
	if len(cf.Types) == 0 {
		return fmt.Errorf("comment frame types must not be empty: %w", apperr.ErrInvalidArgument)
	}

	typeMap := make(map[string]struct{}, len(cf.Types))
	for _, t := range cf.Types {
		if _, ok := typeMap[t]; ok {
			return fmt.Errorf("comment frame type %q is duplicated: %w", t, apperr.ErrInvalidArgument)
		}
		typeMap[t] = struct{}{}
	}

	for _, p := range cf.Paths {
		if _, ok := typeMap[p.Child]; !ok {
			return fmt.Errorf("comment path child %q is not in types: %w", p.Child, apperr.ErrInvalidArgument)
		}
		if _, ok := typeMap[p.Parent]; !ok {
			return fmt.Errorf("comment path parent %q is not in types: %w", p.Parent, apperr.ErrInvalidArgument)
		}
	}
	return nil
}

type CommentPath struct {
	Child  string
	Parent string
}
