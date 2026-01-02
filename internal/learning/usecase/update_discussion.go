package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type UpdateDiscussionUsecase struct {
	repo domain.DiscussionRepository
}

func NewUpdateDiscussionUsecase(repo domain.DiscussionRepository) *UpdateDiscussionUsecase {
	return &UpdateDiscussionUsecase{
		repo: repo,
	}
}

type UpdateDiscussionInput struct {
	ID        string
	CreatedBy string
	Theme     string
}

func (u *UpdateDiscussionUsecase) Execute(ctx context.Context, input UpdateDiscussionInput) (*domain.Discussion, error) {
	discussion, err := u.repo.Load(ctx, domain.LoadParams{
		ID:        input.ID,
		CreatedBy: input.CreatedBy,
	})
	if err != nil {
		return nil, err
	}

	discussion.Update(domain.UpdateParams{
		Theme: input.Theme,
	})

	if err := u.repo.Save(ctx, discussion); err != nil {
		return nil, err
	}

	return discussion, nil
}
