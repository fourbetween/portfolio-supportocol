package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
)

type ListDiscussionsUsecase struct {
	repo domain.DiscussionRepository
}

func NewListDiscussionsUsecase(repo domain.DiscussionRepository) *ListDiscussionsUsecase {
	return &ListDiscussionsUsecase{
		repo: repo,
	}
}

func (u *ListDiscussionsUsecase) Execute(ctx context.Context) ([]*domain.Discussion, error) {
	return u.repo.Search(ctx)
}
