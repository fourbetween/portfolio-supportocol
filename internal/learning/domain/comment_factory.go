package domain

import (
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
	Body            CommentBody
	Status          CommentStatus
	CreatedBy       *string
	Issues          []CommentIssue
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
	CreatedAt  time.Time
	ArchivedAt *time.Time
}

func (f *CommentFactory) Reconstruct(params ReconstructCommentParams) (*Comment, error) {
	c := &Comment{
		id:              params.ID,
		discussionID:    params.DiscussionID,
		parentCommentID: params.ParentCommentID,
		body:            params.Body,
		status:          params.Status,
		audit: CommentAudit{
			CreatedBy:  params.CreatedBy,
			CreatedAt:  params.CreatedAt,
			ArchivedAt: params.ArchivedAt,
		},
		issues: params.Issues,
	}

	if err := c.Validate(); err != nil {
		return nil, err
	}

	return c, nil
}
