package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type PublishDiscussionUsecase struct {
	repo domain.DiscussionRepository
}

func NewPublishDiscussionUsecase(repo domain.DiscussionRepository) *PublishDiscussionUsecase {
	return &PublishDiscussionUsecase{
		repo: repo,
	}
}

type PublishDiscussionInput struct {
	ID           string
	CreatedBy    string
	CommentFrame domain.CommentFrame
}

func (u *PublishDiscussionUsecase) Execute(ctx context.Context, input PublishDiscussionInput) (*domain.Discussion, error) {
	discussion, err := u.repo.Load(ctx, domain.LoadDiscussionParams{
		ID:        input.ID,
		CreatedBy: input.CreatedBy,
	})
	if err != nil {
		return nil, err
	}

	if err := discussion.Publish(domain.PublishParams{
		CommentFrame: input.CommentFrame,
	}); err != nil {
		return nil, err
	}

	if err := u.repo.Save(ctx, discussion); err != nil {
		return nil, err
	}

	return discussion, nil
}
