package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type DeleteCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
}

func NewDeleteCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
) *DeleteCommentUsecase {
	return &DeleteCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
	}
}

type DeleteCommentInput struct {
	ID           string
	DiscussionID string
	UserID       string
}

func (u *DeleteCommentUsecase) Execute(ctx context.Context, input DeleteCommentInput) error {
	// Verify discussion exists and user has access
	_, err := u.discussionRepo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return err
	}

	comment, err := u.commentRepo.LoadComment(ctx, input.ID)
	if err != nil {
		return err
	}

	if comment.PostedBy() != input.UserID {
		return apperr.ErrForbidden
	}

	return u.commentRepo.DeleteComment(ctx, comment)
}
