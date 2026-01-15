package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type UpdateDiscussionStatusUsecase struct {
	repo domain.DiscussionRepository
}

func NewUpdateDiscussionStatusUsecase(repo domain.DiscussionRepository) *UpdateDiscussionStatusUsecase {
	return &UpdateDiscussionStatusUsecase{
		repo: repo,
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

	if err := u.repo.Save(ctx, discussion); err != nil {
		return nil, err
	}

	return discussion, nil
}
