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
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// Verify discussion exists and user has access
		discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
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

		if err := u.commentRepo.Delete(ctx, comment); err != nil {
			return err
		}

		count, err := u.commentRepo.CountByDiscussionID(ctx, input.DiscussionID)
		if err != nil {
			return err
		}
		discussion.SyncCommentsCount(count)
		return u.discussionRepo.Save(ctx, discussion)
	})
}
