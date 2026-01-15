package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type DeleteCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	tx             dbtx.Manager
}

func NewDeleteCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	tx dbtx.Manager,
) *DeleteCommentUsecase {
	return &DeleteCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		tx:             tx,
	}
}

type DeleteCommentInput struct {
	ID           string
	DiscussionID string
	UserID       string
}

func (u *DeleteCommentUsecase) Execute(ctx context.Context, input DeleteCommentInput) error {
	// Verify discussion exists and user has access
	_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return err
	}

	comment, err := u.commentRepo.Load(ctx, input.ID)
	if err != nil {
		return err
	}

	if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
		return err
	}

	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		return u.commentRepo.Delete(ctx, comment)
	})
}
