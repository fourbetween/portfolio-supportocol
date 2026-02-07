package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type DeleteCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	permSv         domain.PermissionService
	tx             dbtx.Manager
}

func NewDeleteCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	permSv domain.PermissionService,
	tx dbtx.Manager,
) *DeleteCommentUsecase {
	return &DeleteCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		permSv:         permSv,
		tx:             tx,
	}
}

type DeleteCommentInput struct {
	ID           string
	DiscussionID string
	WorkspaceID  string
	UserID       string
}

func (u *DeleteCommentUsecase) Execute(ctx context.Context, input DeleteCommentInput) error {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return apperr.ErrPermissionDenied
	}

	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// Verify discussion exists and user has access
		discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.DiscussionID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		comment, err := u.commentRepo.Load(ctx, input.ID)
		if err != nil {
			return err
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		if err := u.commentRepo.Delete(ctx, comment); err != nil {
			return err
		}

		counts, err := u.commentRepo.CountsByDiscussionID(ctx, input.DiscussionID)
		if err != nil {
			return err
		}
		discussion.SyncCounts(counts)
		return u.discussionRepo.Save(ctx, discussion)
	})
}
