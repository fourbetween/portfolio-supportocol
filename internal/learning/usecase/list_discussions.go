package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type ListDiscussionsUsecase struct {
	repo domain.Repository
}

func NewListDiscussionsUsecase(repo domain.Repository) *ListDiscussionsUsecase {
	return &ListDiscussionsUsecase{
		repo: repo,
	}
}

func (u *ListDiscussionsUsecase) Execute(ctx context.Context, createdBy string) ([]*domain.Discussion, error) {
	return u.repo.List(ctx, createdBy)
}
