package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type GetDiscussionUsecase struct {
	repo domain.Repository
}

func NewGetDiscussionUsecase(repo domain.Repository) *GetDiscussionUsecase {
	return &GetDiscussionUsecase{
		repo: repo,
	}
}

type GetDiscussionInput struct {
	ID        string
	CreatedBy string
}

func (u *GetDiscussionUsecase) Execute(ctx context.Context, input GetDiscussionInput) (*domain.Discussion, error) {
	return u.repo.Load(ctx, domain.LoadParams{
		ID:        input.ID,
		CreatedBy: input.CreatedBy,
	})
}
