package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type DeleteDiscussionUsecase struct {
	repo domain.DiscussionRepository
}

func NewDeleteDiscussionUsecase(repo domain.DiscussionRepository) *DeleteDiscussionUsecase {
	return &DeleteDiscussionUsecase{
		repo: repo,
	}
}

type DeleteDiscussionInput struct {
	ID        string
	CreatedBy string
}

func (u *DeleteDiscussionUsecase) Execute(ctx context.Context, input DeleteDiscussionInput) error {
	discussion, err := u.repo.Load(ctx, domain.LoadDiscussionParams{
		ID:        input.ID,
		CreatedBy: input.CreatedBy,
	})
	if err != nil {
		return err
	}

	return u.repo.Delete(ctx, discussion)
}
