package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UnarchiveDiscussionUsecase struct {
	repo domain.DiscussionRepository
	tx   dbtx.Manager
}

func NewUnarchiveDiscussionUsecase(repo domain.DiscussionRepository, tx dbtx.Manager) *UnarchiveDiscussionUsecase {
	return &UnarchiveDiscussionUsecase{
		repo: repo,
		tx:   tx,
	}
}

type UnarchiveDiscussionInput struct {
	ID        string
	CreatedBy string
}

func (u *UnarchiveDiscussionUsecase) Execute(ctx context.Context, input UnarchiveDiscussionInput) (*domain.Discussion, error) {
	var discussion *domain.Discussion
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		var err error
		discussion, err = u.repo.Load(ctx, domain.LoadDiscussionParams{
			ID:        input.ID,
			CreatedBy: input.CreatedBy,
		})
		if err != nil {
			return err
		}

		if err := discussion.Unarchive(); err != nil {
			return err
		}

		if err := u.repo.Save(ctx, discussion); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return discussion, nil
}
