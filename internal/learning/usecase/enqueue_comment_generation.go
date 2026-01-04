package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type EnqueueCommentGenerationUsecase struct {
	discussionRepo domain.DiscussionRepository
	queue          domain.CommentGenerationQueue
}

func NewEnqueueCommentGenerationUsecase(
	discussionRepo domain.DiscussionRepository,
	queue domain.CommentGenerationQueue,
) *EnqueueCommentGenerationUsecase {
	return &EnqueueCommentGenerationUsecase{
		discussionRepo: discussionRepo,
		queue:          queue,
	}
}

func (u *EnqueueCommentGenerationUsecase) Execute(ctx context.Context, input GenerateCommentInput) error {
	// Verify discussion exists and user has access
	_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return err
	}

	params := domain.GenerateCommentParams(input)
	return u.queue.Enqueue([]domain.GenerateCommentParams{params})
}
