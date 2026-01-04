package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type UpdateCommentStatusUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
}

func NewUpdateCommentStatusUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
) *UpdateCommentStatusUsecase {
	return &UpdateCommentStatusUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
	}
}

type UpdateCommentStatusInput struct {
	ID           string
	DiscussionID string
	UserID       string
	Status       string
}

func (u *UpdateCommentStatusUsecase) Execute(ctx context.Context, input UpdateCommentStatusInput) (*domain.Comment, error) {
	// Verify discussion exists and user has access
	_, err := u.discussionRepo.Load(ctx, domain.LoadParams{
		ID:        input.DiscussionID,
		CreatedBy: input.UserID,
	})
	if err != nil {
		return nil, err
	}

	comment, err := u.commentRepo.Load(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	if comment.CreatedBy() != input.UserID {
		return nil, apperr.ErrForbidden
	}

	status := domain.CommentStatus(input.Status)
	if err := comment.UpdateStatus(status); err != nil {
		return nil, err
	}

	if err := u.commentRepo.Save(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}
