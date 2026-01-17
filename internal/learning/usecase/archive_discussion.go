package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type ArchiveDiscussionUsecase struct {
	repo  domain.DiscussionRepository
	tx    dbtx.Manager
	clock clock.Service
}

func NewArchiveDiscussionUsecase(repo domain.DiscussionRepository, tx dbtx.Manager, clock clock.Service) *ArchiveDiscussionUsecase {
	return &ArchiveDiscussionUsecase{
		repo:  repo,
		tx:    tx,
		clock: clock,
	}
}

type ArchiveDiscussionInput struct {
	ID        string
	CreatedBy string
}

func (u *ArchiveDiscussionUsecase) Execute(ctx context.Context, input ArchiveDiscussionInput) (*domain.Discussion, error) {
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

		if err := discussion.Archive(u.clock.Now()); err != nil {
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
