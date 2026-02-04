package domain

import (
	"fmt"
	"slices"
	"sort"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type CommentFrame struct {
	Types []string
	Paths []CommentPath
}

func (cf CommentFrame) Sorted() CommentFrame {
	sortedTypes := append([]string{}, cf.Types...)
	sort.Strings(sortedTypes)

	sortedPaths := append([]CommentPath{}, cf.Paths...)
	sort.Slice(sortedPaths, func(i, j int) bool {
		if sortedPaths[i].Parent != sortedPaths[j].Parent {
			return sortedPaths[i].Parent < sortedPaths[j].Parent
		}
		return sortedPaths[i].Child < sortedPaths[j].Child
	})

	return CommentFrame{
		Types: sortedTypes,
		Paths: sortedPaths,
	}
}

func (cf CommentFrame) Add(child, parent string) CommentFrame {
	newCF := cf
	typeExists := slices.Contains(newCF.Types, child)
	if !typeExists {
		newCF.Types = append(newCF.Types, child)
	}

	pathExists := false
	for _, p := range newCF.Paths {
		if p.Child == child && p.Parent == parent {
			pathExists = true
			break
		}
	}

	if !pathExists {
		newCF.Paths = append(newCF.Paths, CommentPath{
			Child:  child,
			Parent: parent,
		})
	}

	if !typeExists || !pathExists {
		return newCF.Sorted()
	}
	return cf
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

func (cf CommentFrame) Supplement(comments []*Comment) CommentFrame {
	newCF := CommentFrame{
		Types: append([]string{}, cf.Types...),
		Paths: append([]CommentPath{}, cf.Paths...),
	}

	typeMap := make(map[string]struct{}, len(newCF.Types))
	for _, t := range newCF.Types {
		typeMap[t] = struct{}{}
	}

	pathMap := make(map[CommentPath]struct{}, len(newCF.Paths))
	for _, p := range newCF.Paths {
		pathMap[p] = struct{}{}
	}

	commentMap := make(map[string]*Comment, len(comments))
	for _, c := range comments {
		commentMap[c.ID()] = c
	}

	for _, c := range comments {
		if _, ok := typeMap[c.Type()]; !ok {
			newCF.Types = append(newCF.Types, c.Type())
			typeMap[c.Type()] = struct{}{}
		}

		var parentType string
		if c.ParentCommentID() != nil {
			if parent, ok := commentMap[*c.ParentCommentID()]; ok {
				parentType = parent.Type()
			}
		}

		path := CommentPath{
			Child:  c.Type(),
			Parent: parentType,
		}
		if _, ok := pathMap[path]; !ok {
			newCF.Paths = append(newCF.Paths, path)
			pathMap[path] = struct{}{}
		}
	}

	return newCF.Sorted()
}
