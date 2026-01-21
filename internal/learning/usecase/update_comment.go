package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	tx             dbtx.Manager
}

func NewUpdateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	tx dbtx.Manager,
) *UpdateCommentUsecase {
	return &UpdateCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		tx:             tx,
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
	var comment *domain.Comment
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// Verify discussion exists and user has access
		discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:        input.DiscussionID,
			CreatedBy: input.UserID,
		})
		if err != nil {
			return err
		}

		var loadErr error
		comment, loadErr = u.commentRepo.Load(ctx, input.ID)
		if loadErr != nil {
			return loadErr
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		var parentType string
		if discussion.Status().IsPublic() && comment.ParentCommentID() != nil {
			parent, err := u.commentRepo.Load(ctx, *comment.ParentCommentID())
			if err != nil {
				return err
			}
			parentType = parent.CommentType()
		}

		if err := comment.Update(domain.UpdateCommentParams{
			CommentType: input.CommentType,
			Content:     input.Content,
		}); err != nil {
			return err
		}

		if err := u.commentRepo.Update(ctx, comment); err != nil {
			return err
		}

		discussion.EnsureCommentFrameRequirement(comment.CommentType(), parentType)
		return u.discussionRepo.Save(ctx, discussion)
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
