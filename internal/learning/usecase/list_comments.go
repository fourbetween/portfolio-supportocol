package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type ListCommentsUsecase struct {
	repo domain.Repository
}

func NewListCommentsUsecase(repo domain.Repository) *ListCommentsUsecase {
	return &ListCommentsUsecase{
		repo: repo,
	}
}

type ListCommentsInput struct {
	DiscussionID string
	UserID       string
}

func (u *ListCommentsUsecase) Execute(ctx context.Context, input ListCommentsInput) ([]*domain.Comment, error) {
	// Verify discussion exists and user has access
	_, err := u.repo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return nil, err
	}

	return u.repo.FetchComments(ctx, input.DiscussionID)
}
