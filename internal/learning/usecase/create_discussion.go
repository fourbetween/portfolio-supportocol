package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type CreateDiscussionUsecase struct {
	repo domain.Repository
	fac  *domain.Factory
}

func NewCreateDiscussionUsecase(repo domain.Repository, fac *domain.Factory) *CreateDiscussionUsecase {
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
	discussion := u.fac.NewDiscussion(domain.NewDiscussionParams{
		Theme:     input.Theme,
		CreatedBy: input.CreatedBy,
	})

	if err := u.repo.Save(ctx, discussion); err != nil {
		return nil, err
	}

	return discussion, nil
}
