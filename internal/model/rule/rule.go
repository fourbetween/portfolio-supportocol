package rule

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal"
)

type Rule struct {
	id               string
	name             string
	description      string
	createdBy        string
	createdAt        time.Time
	commentTypes     []CommentType
	commentTypePaths []CommentTypePath

	repo Repository
}

type UpdateParams struct {
	Name             string
	Description      string
	CommentTypes     []CommentType
	CommentTypePaths []CommentTypePath
}

func (r *Rule) ID() string {
	return r.id
}

func (r *Rule) Name() string {
	return r.name
}

func (r *Rule) Description() string {
	return r.description
}

func (r *Rule) CreatedBy() string {
	return r.createdBy
}

func (r *Rule) CreatedAt() time.Time {
	return r.createdAt
}

func (r *Rule) CommentTypes() []CommentType {
	return r.commentTypes
}

func (r *Rule) CommentType(typeID string) (CommentType, error) {
	for _, ct := range r.commentTypes {
		if ct.ID == typeID {
			return ct, nil
		}
	}
	return CommentType{}, fmt.Errorf("comment type %q not found: %w", typeID, internal.ErrNotFound)
}

func (r *Rule) CommentTypePaths() []CommentTypePath {
	return r.commentTypePaths
}

func (r *Rule) Validate() error {
	commentTypeIDs := make(map[string]struct{}, len(r.commentTypes))
	for _, ct := range r.commentTypes {
		if _, ok := commentTypeIDs[ct.ID]; ok {
			return fmt.Errorf("CommentTypeID %q is duplicated: %w", ct.ID, internal.ErrConflict)
		}
		commentTypeIDs[ct.ID] = struct{}{}
	}

	for _, path := range r.commentTypePaths {
		if path.ChildCommentTypeID == "" {
			return fmt.Errorf("ChildCommentTypeID is empty: %w", internal.ErrConflict)
		}
		if path.ParentCommentTypeID == "" {
			return fmt.Errorf("ParentCommentTypeID is empty: %w", internal.ErrConflict)
		}
		if _, ok := commentTypeIDs[path.ChildCommentTypeID]; !ok {
			return fmt.Errorf("FromCommentTypeID %q is not defined in CommentTypes: %w", path.ChildCommentTypeID, internal.ErrConflict)
		}
		if _, ok := commentTypeIDs[path.ParentCommentTypeID]; !ok {
			return fmt.Errorf("ToCommentTypeID %q is not defined in CommentTypes: %w", path.ParentCommentTypeID, internal.ErrConflict)
		}
	}

	return nil
}

func (r *Rule) Update(params UpdateParams) error {
	// 一時的に新しい値を設定してバリデーション
	oldName := r.name
	oldDescription := r.description
	oldCommentTypes := r.commentTypes
	oldCommentTypePaths := r.commentTypePaths

	r.name = params.Name
	r.description = params.Description
	r.commentTypes = params.CommentTypes
	r.commentTypePaths = params.CommentTypePaths

	if err := r.Validate(); err != nil {
		// 元の値に戻す
		r.name = oldName
		r.description = oldDescription
		r.commentTypes = oldCommentTypes
		r.commentTypePaths = oldCommentTypePaths
		return err
	}

	return nil
}

func (r *Rule) IsValidPath(fromCommentTypeID, toCommentTypeID string) error {
	// ルートコメントの場合（親がない場合）
	if toCommentTypeID == "" {
		// CommentType.Root=trueの場合、ルートコメントとして許可
		from, err := r.CommentType(fromCommentTypeID)
		if err != nil {
			return err
		}
		if from.Root {
			return nil
		}
		return fmt.Errorf("comment type %q is not allowed as root: %w", from.Name, internal.ErrConflict)
	}

	for _, path := range r.commentTypePaths {
		if path.ChildCommentTypeID == fromCommentTypeID && path.ParentCommentTypeID == toCommentTypeID {
			return nil
		}
	}
	from, err := r.CommentType(fromCommentTypeID)
	if err != nil {
		return err
	}
	to, err := r.CommentType(toCommentTypeID)
	if err != nil {
		return err
	}
	return fmt.Errorf("not allowed path from %q to %q: %w", from.Name, to.Name, internal.ErrConflict)
}

func (r *Rule) Save() error {
	return r.repo.Save(r)
}

func (r *Rule) Delete() error {
	return r.repo.Delete(r)
}
