package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateDiscussionUsecase struct {
	repo domain.DiscussionRepository
	tx   dbtx.Manager
}

func NewUpdateDiscussionUsecase(repo domain.DiscussionRepository, tx dbtx.Manager) *UpdateDiscussionUsecase {
	return &UpdateDiscussionUsecase{
		repo: repo,
		tx:   tx,
	}
}

type UpdateDiscussionInput struct {
	ID         string
	CreatedBy  string
	Theme      string
	Conclusion string
}

func (u *UpdateDiscussionUsecase) Execute(ctx context.Context, input UpdateDiscussionInput) (*domain.Discussion, error) {
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

		if err := discussion.Update(domain.UpdateParams{
			Theme:      input.Theme,
			Conclusion: input.Conclusion,
		}); err != nil {
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
