package domain

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type Factory struct {
	idSrv    id.Service
	clockSrv clock.Service
}

func NewFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *Factory {
	return &Factory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

type NewDiscussionParams struct {
	Theme     string
	CreatedBy string
}

func (f *Factory) NewDiscussion(params NewDiscussionParams) *Discussion {
	id := f.idSrv.Generate()
	return f.BuildDiscussion(BuildDiscussionParams{
		ID:                  id,
		NewDiscussionParams: params,
		CreatedAt:           f.clockSrv.Now(),
	})
}

type BuildDiscussionParams struct {
	ID string
	NewDiscussionParams
	CreatedAt time.Time
}

func (f *Factory) BuildDiscussion(params BuildDiscussionParams) *Discussion {
	return &Discussion{
		id:        params.ID,
		theme:     params.Theme,
		createdBy: params.CreatedBy,
		createdAt: params.CreatedAt,
	}
}

type NewCommentParams struct {
	DiscussionID    string
	ParentCommentID string
	CommentTypeID   string
	Content         string
	PostedBy        string
}

func (f *Factory) NewComment(params NewCommentParams) *Comment {
	id := f.idSrv.Generate()
	return f.BuildComment(BuildCommentParams{
		ID:               id,
		NewCommentParams: params,
		CreatedAt:        f.clockSrv.Now(),
	})
}

type BuildCommentParams struct {
	ID string
	NewCommentParams
	CreatedAt time.Time
}

func (f *Factory) BuildComment(params BuildCommentParams) *Comment {
	return &Comment{
		id:              params.ID,
		discussionID:    params.DiscussionID,
		parentCommentID: params.ParentCommentID,
		commentType:     params.CommentTypeID,
		content:         params.Content,
		postedBy:        params.PostedBy,
		createdAt:       params.CreatedAt,
	}
}
