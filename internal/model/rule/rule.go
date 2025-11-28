package rule

import (
	"fmt"
	"time"
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

func (r *Rule) CommentTypePaths() []CommentTypePath {
	return r.commentTypePaths
}

func (r *Rule) Validate() error {
	commentTypeIDs := make(map[string]struct{}, len(r.commentTypes))
	for _, ct := range r.commentTypes {
		if _, ok := commentTypeIDs[ct.ID]; ok {
			return fmt.Errorf("CommentTypeID %q is duplicated", ct.ID)
		}
		commentTypeIDs[ct.ID] = struct{}{}
	}

	for _, path := range r.commentTypePaths {
		if _, ok := commentTypeIDs[path.FromCommentTypeID]; !ok {
			return fmt.Errorf("FromCommentTypeID %q is not defined in CommentTypes", path.FromCommentTypeID)
		}
		if _, ok := commentTypeIDs[path.ToCommentTypeID]; !ok {
			return fmt.Errorf("ToCommentTypeID %q is not defined in CommentTypes", path.ToCommentTypeID)
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

func (r *Rule) Save() error {
	return r.repo.Save(r)
}

func (r *Rule) Delete() error {
	return r.repo.Delete(r)
}
