package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type GenerateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	generator      domain.CommentGenerator
}

func NewGenerateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	generator domain.CommentGenerator,
) *GenerateCommentUsecase {
	return &GenerateCommentUsecase{
		discussionRepo: discussionRepo,
		generator:      generator,
	}
}

type GenerateCommentInput struct {
	DiscussionID    string
	ParentCommentID *string
	CommentType     string
	UserID          string
}

func (u *GenerateCommentUsecase) Execute(ctx context.Context, input GenerateCommentInput) ([]*domain.Comment, error) {
	// Verify discussion exists and user has access
	_, err := u.discussionRepo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return nil, err
	}

	return u.generator.Generate(ctx, domain.GenerateCommentParams{
		DiscussionID:    input.DiscussionID,
		ParentCommentID: input.ParentCommentID,
		CommentType:     input.CommentType,
	})
}
