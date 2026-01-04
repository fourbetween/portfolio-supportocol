package usecase

import (
	"context"
	"time"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
)

type ListCommentsUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
}

func NewListCommentsUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
) *ListCommentsUsecase {
	return &ListCommentsUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
	}
}

type ListCommentsInput struct {
	DiscussionID string
	UserID       string
	Since        *time.Time
}

func (u *ListCommentsUsecase) Execute(ctx context.Context, input ListCommentsInput) ([]*domain.Comment, error) {
	// Verify discussion exists and user has access
	_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return nil, err
	}

	return u.commentRepo.Search(ctx, domain.SearchCommentsParams{
		DiscussionID: input.DiscussionID,
		Since:        input.Since,
	})
}
