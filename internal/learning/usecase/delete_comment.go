package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type DeleteCommentUsecase struct {
	repo domain.Repository
}

func NewDeleteCommentUsecase(repo domain.Repository) *DeleteCommentUsecase {
	return &DeleteCommentUsecase{
		repo: repo,
	}
}

type DeleteCommentInput struct {
	ID           string
	DiscussionID string
	UserID       string
}

func (u *DeleteCommentUsecase) Execute(ctx context.Context, input DeleteCommentInput) error {
	// Verify discussion exists and user has access
	_, err := u.repo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return err
	}

	comment, err := u.repo.LoadComment(ctx, input.ID)
	if err != nil {
		return err
	}

	if comment.PostedBy() != input.UserID {
		return apperr.ErrForbidden
	}

	return u.repo.DeleteComment(ctx, comment)
}
