package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type GenerateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	generator      domain.CommentGenerator
	tx             dbtx.Manager
}

func NewGenerateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	generator domain.CommentGenerator,
	tx dbtx.Manager,
) *GenerateCommentUsecase {
	return &GenerateCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		generator:      generator,
		tx:             tx,
	}
}

type GenerateCommentInput struct {
	DiscussionID    string
	ParentCommentID *string
	CommentType     string
	UserID          string
}

func (u *GenerateCommentUsecase) Execute(ctx context.Context, input GenerateCommentInput) ([]*domain.Comment, error) {
	_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return nil, err
	}

	comments, err := u.generator.Generate(ctx, domain.GenerateCommentParams{
		DiscussionID:    input.DiscussionID,
		ParentCommentID: input.ParentCommentID,
		CommentType:     input.CommentType,
		UserID:          input.UserID,
	})
	if err != nil {
		return nil, err
	}

	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		return u.commentRepo.BatchCreate(ctx, comments)
	})
	if err != nil {
		return nil, err
	}

	return comments, nil
}
