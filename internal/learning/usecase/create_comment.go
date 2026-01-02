package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type CreateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	fac            *domain.CommentFactory
}

func NewCreateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	fac *domain.CommentFactory,
) *CreateCommentUsecase {
	return &CreateCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		fac:            fac,
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
	_, err := u.discussionRepo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.PostedBy,
	})
	if err != nil {
		return nil, err
	}

	comment, err := u.fac.Create(domain.CreateCommentParams{
		DiscussionID:    input.DiscussionID,
		ParentCommentID: input.ParentCommentID,
		CommentTypeID:   input.CommentType,
		Content:         input.Content,
		Status:          domain.CommentStatusActive,
		PostedBy:        input.PostedBy,
	})
	if err != nil {
		return nil, err
	}

	if err := u.commentRepo.Save(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}
