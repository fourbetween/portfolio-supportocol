package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type CreateDiscussionUsecase struct {
	repo domain.DiscussionRepository
	fac  *domain.DiscussionFactory
	tx   dbtx.Manager
}

func NewCreateDiscussionUsecase(
	repo domain.DiscussionRepository,
	fac *domain.DiscussionFactory,
	tx dbtx.Manager,
) *CreateDiscussionUsecase {
	return &CreateDiscussionUsecase{
		repo: repo,
		fac:  fac,
		tx:   tx,
	}
}

type CreateDiscussionInput struct {
	Theme     string
	Status    domain.DiscussionStatus
	CreatedBy string
}

func (u *CreateDiscussionUsecase) Execute(ctx context.Context, input CreateDiscussionInput) (*domain.Discussion, error) {
	var discussion *domain.Discussion
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		var err error
		discussion, err = u.fac.Create(domain.CreateDiscussionParams{
			Theme:     input.Theme,
			Status:    input.Status,
			CreatedBy: input.CreatedBy,
		})
		if err != nil {
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
