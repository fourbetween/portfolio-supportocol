package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type CreateDiscussionUsecase struct {
	repo domain.DiscussionRepository
	fac  *domain.DiscussionFactory
}

func NewCreateDiscussionUsecase(repo domain.DiscussionRepository, fac *domain.DiscussionFactory) *CreateDiscussionUsecase {
	return &CreateDiscussionUsecase{
		repo: repo,
		fac:  fac,
	}
}

type CreateDiscussionInput struct {
	Theme     string
	CreatedBy string
}

func (u *CreateDiscussionUsecase) Execute(ctx context.Context, input CreateDiscussionInput) (*domain.Discussion, error) {
	discussion := u.fac.Create(domain.CreateDiscussionParams{
		Theme:     input.Theme,
		CreatedBy: input.CreatedBy,
	})

	if err := u.repo.Save(ctx, discussion); err != nil {
		return nil, err
	}

	return discussion, nil
}
