package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateCommentStatusUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	tx             dbtx.Manager
}

func NewUpdateCommentStatusUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	tx dbtx.Manager,
) *UpdateCommentStatusUsecase {
	return &UpdateCommentStatusUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		tx:             tx,
	}
}

type UpdateCommentStatusInput struct {
	ID           string
	DiscussionID string
	UserID       string
	Status       string
}

func (u *UpdateCommentStatusUsecase) Execute(ctx context.Context, input UpdateCommentStatusInput) (*domain.Comment, error) {
	var comment *domain.Comment
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// Verify discussion exists and user has access
		_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:        input.DiscussionID,
			CreatedBy: input.UserID,
		})
		if err != nil {
			return err
		}

		var loadErr error
		comment, loadErr = u.commentRepo.Load(ctx, input.ID)
		if loadErr != nil {
			return loadErr
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		status := domain.CommentStatus(input.Status)
		if err := comment.UpdateStatus(status); err != nil {
			return err
		}

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
