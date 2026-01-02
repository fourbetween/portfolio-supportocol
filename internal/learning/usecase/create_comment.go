package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type CreateCommentUsecase struct {
	repo domain.Repository
	fac  *domain.Factory
}

func NewCreateCommentUsecase(repo domain.Repository, fac *domain.Factory) *CreateCommentUsecase {
	return &CreateCommentUsecase{
		repo: repo,
		fac:  fac,
	}
}

type CreateCommentInput struct {
	DiscussionID    string
	ParentCommentID *string
	CommentType     string
	Content         string
	PostedBy        string
}

func (u *CreateCommentUsecase) Execute(ctx context.Context, input CreateCommentInput) (*domain.Comment, error) {
	// Verify discussion exists and user has access
	_, err := u.repo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.PostedBy,
	})
	if err != nil {
		return nil, err
	}

	comment, err := u.fac.NewComment(domain.NewCommentParams{
		DiscussionID:    input.DiscussionID,
		ParentCommentID: input.ParentCommentID,
		CommentTypeID:   input.CommentType,
		Content:         input.Content,
		PostedBy:        input.PostedBy,
	})
	if err != nil {
		return nil, err
	}

	if err := u.repo.SaveComment(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}
