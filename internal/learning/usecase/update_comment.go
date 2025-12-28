package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type UpdateCommentUsecase struct {
	repo domain.Repository
}

func NewUpdateCommentUsecase(repo domain.Repository) *UpdateCommentUsecase {
	return &UpdateCommentUsecase{
		repo: repo,
	}
}

type UpdateCommentInput struct {
	ID           string
	DiscussionID string
	UserID       string
	Content      string
}

func (u *UpdateCommentUsecase) Execute(ctx context.Context, input UpdateCommentInput) (*domain.Comment, error) {
	// Verify discussion exists and user has access
	_, err := u.repo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return nil, err
	}

	comment, err := u.repo.LoadComment(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	if comment.PostedBy() != input.UserID {
		return nil, apperr.ErrForbidden
	}

	comment.Update(domain.UpdateCommentParams{
		Content: input.Content,
	})

	if err := u.repo.SaveComment(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}
