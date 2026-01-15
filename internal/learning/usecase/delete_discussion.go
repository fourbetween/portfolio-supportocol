package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type DeleteDiscussionUsecase struct {
	repo domain.DiscussionRepository
	tx   dbtx.Manager
}

func NewDeleteDiscussionUsecase(repo domain.DiscussionRepository, tx dbtx.Manager) *DeleteDiscussionUsecase {
	return &DeleteDiscussionUsecase{
		repo: repo,
		tx:   tx,
	}
}

type DeleteDiscussionInput struct {
	ID        string
	CreatedBy string
}

func (u *DeleteDiscussionUsecase) Execute(ctx context.Context, input DeleteDiscussionInput) error {
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		discussion, err := u.repo.Load(ctx, domain.LoadDiscussionParams{
			ID:        input.ID,
			CreatedBy: input.CreatedBy,
		})
		if err != nil {
			return err
		}

		return u.repo.Delete(ctx, discussion)
	})
}
