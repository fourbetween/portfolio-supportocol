package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type CreateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	fac            *domain.CommentFactory
	tx             dbtx.Manager
}

func NewCreateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	fac *domain.CommentFactory,
	tx dbtx.Manager,
) *CreateCommentUsecase {
	return &CreateCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		fac:            fac,
		tx:             tx,
	}
}

type CreateCommentInput struct {
	DiscussionID    string
	ParentCommentID *string
	CommentType     string
	Content         string
}

func (u *CreateCommentUsecase) Execute(ctx context.Context, input CreateCommentInput) (*domain.Comment, error) {
	// Verify discussion exists
	_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID: input.DiscussionID,
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
	})
	if err != nil {
		return nil, err
	}

	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		if err := u.commentRepo.Save(ctx, comment); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
