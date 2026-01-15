package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateDiscussionStatusUsecase struct {
	repo domain.DiscussionRepository
	tx   dbtx.Manager
}

func NewUpdateDiscussionStatusUsecase(repo domain.DiscussionRepository, tx dbtx.Manager) *UpdateDiscussionStatusUsecase {
	return &UpdateDiscussionStatusUsecase{
		repo: repo,
		tx:   tx,
	}
}

type UpdateDiscussionStatusInput struct {
	ID           string
	CreatedBy    string
	Status       string
	CommentFrame *domain.CommentFrame
}

func (u *UpdateDiscussionStatusUsecase) Execute(ctx context.Context, input UpdateDiscussionStatusInput) (*domain.Discussion, error) {
	discussion, err := u.repo.Load(ctx, domain.LoadDiscussionParams{
		ID:        input.ID,
		CreatedBy: input.CreatedBy,
	})
	if err != nil {
		return nil, err
	}

	if err := discussion.UpdateStatus(domain.UpdateStatusParams{
		Status:       domain.DiscussionStatus(input.Status),
		CommentFrame: input.CommentFrame,
	}); err != nil {
		return nil, err
	}

	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
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
