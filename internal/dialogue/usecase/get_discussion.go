package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
)

type GetDiscussionUsecase struct {
	repo domain.DiscussionRepository
}

func NewGetDiscussionUsecase(repo domain.DiscussionRepository) *GetDiscussionUsecase {
	return &GetDiscussionUsecase{
		repo: repo,
	}
}

type GetDiscussionInput struct {
	ID string
}

func (u *GetDiscussionUsecase) Execute(ctx context.Context, input GetDiscussionInput) (*domain.Discussion, error) {
	return u.repo.Load(ctx, domain.LoadDiscussionParams{
		ID: input.ID,
	})
}
