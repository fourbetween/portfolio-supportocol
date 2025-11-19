package rule

import "time"

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

func (r *Rule) Update(params UpdateParams) {
	r.name = params.Name
	r.description = params.Description
	r.commentTypes = params.CommentTypes
	r.commentTypePaths = params.CommentTypePaths
}

func (r *Rule) Save() error {
	return r.repo.Save(r)
}

func (r *Rule) Delete() error {
	return r.repo.Delete(r)
}
