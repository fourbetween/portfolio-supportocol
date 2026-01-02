package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type UpdateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
}

func NewUpdateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
) *UpdateCommentUsecase {
	return &UpdateCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
	}
}

type UpdateCommentInput struct {
	ID           string
	DiscussionID string
	UserID       string
	CommentType  string
	Content      string
}

func (u *UpdateCommentUsecase) Execute(ctx context.Context, input UpdateCommentInput) (*domain.Comment, error) {
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

	if comment.PostedBy() != input.UserID {
		return nil, apperr.ErrForbidden
	}

	comment.Update(domain.UpdateCommentParams{
		CommentType: input.CommentType,
		Content:     input.Content,
	})

	if err := u.commentRepo.Save(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}
