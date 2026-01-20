package domain

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type DialogueSettings struct {
	CommentFrame CommentFrame
}

func (s DialogueSettings) Validate() error {
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
		if p.Parent != "" {
			if _, ok := typeMap[p.Parent]; !ok {
				return fmt.Errorf("comment path parent %q is not in types: %w", p.Parent, apperr.ErrInvalidArgument)
			}
		}
	}
	return nil
}

type CommentPath struct {
	Child  string
	Parent string
}

func (cf *CommentFrame) Supplement(comments []*Comment) {
	typeMap := make(map[string]struct{}, len(cf.Types))
	for _, t := range cf.Types {
		typeMap[t] = struct{}{}
	}

	pathMap := make(map[CommentPath]struct{}, len(cf.Paths))
	for _, p := range cf.Paths {
		pathMap[p] = struct{}{}
	}

	commentMap := make(map[string]*Comment, len(comments))
	for _, c := range comments {
		commentMap[c.ID()] = c
	}

	for _, c := range comments {
		if _, ok := typeMap[c.CommentType()]; !ok {
			cf.Types = append(cf.Types, c.CommentType())
			typeMap[c.CommentType()] = struct{}{}
		}

		var parentType string
		if c.ParentCommentID() != nil {
			if parent, ok := commentMap[*c.ParentCommentID()]; ok {
				parentType = parent.CommentType()
			}
		}

		path := CommentPath{
			Child:  c.CommentType(),
			Parent: parentType,
		}
		if _, ok := pathMap[path]; !ok {
			cf.Paths = append(cf.Paths, path)
			pathMap[path] = struct{}{}
		}
	}
}
