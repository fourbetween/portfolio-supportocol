package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type CommentFactory struct {
	idSrv    id.Service
	clockSrv clock.Service
}

func NewCommentFactory(
	idSrv id.Service,
	clockSrv clock.Service,
) *CommentFactory {
	return &CommentFactory{
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

type CreateCommentParams struct {
	DiscussionID    string
	ParentCommentID *string
	CommentTypeID   string
	Content         string
	Status          CommentStatus
	PostedBy        string
}

func (f *CommentFactory) Create(params CreateCommentParams) (*Comment, error) {
	id := f.idSrv.Generate()
	return f.Reconstruct(ReconstructCommentParams{
		ID:                  id,
		CreateCommentParams: params,
		CreatedAt:           f.clockSrv.Now(),
	})
}

type ReconstructCommentParams struct {
	ID string
	CreateCommentParams
	CreatedAt time.Time
}

func (f *CommentFactory) Reconstruct(params ReconstructCommentParams) (*Comment, error) {
	if !params.Status.IsValid() {
		return nil, fmt.Errorf("invalid comment status")
	}
	return &Comment{
		id:              params.ID,
		discussionID:    params.DiscussionID,
		parentCommentID: params.ParentCommentID,
		commentType:     params.CommentTypeID,
		content:         params.Content,
		status:          params.Status,
		postedBy:        params.PostedBy,
		createdAt:       params.CreatedAt,
	}, nil
}
