package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type LiftCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	permSv         domain.PermissionService
	tx             dbtx.Manager
}

func NewLiftCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	permSv domain.PermissionService,
	tx dbtx.Manager,
) *LiftCommentUsecase {
	return &LiftCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		permSv:         permSv,
		tx:             tx,
	}
}

type LiftCommentInput struct {
	ID           string
	DiscussionID string
	WorkspaceID  string
	UserID       string
}

func (u *LiftCommentUsecase) Execute(ctx context.Context, input LiftCommentInput) error {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return apperr.ErrPermissionDenied
	}

	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.DiscussionID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		if !discussion.IsCreatedBy(input.UserID) && !access.CanManage {
			return apperr.ErrPermissionDenied
		}

		comment, err := u.commentRepo.Load(ctx, input.ID)
		if err != nil {
			return err
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		children, err := u.commentRepo.ListChildren(ctx, domain.ListCommentChildrenParams{
			DiscussionID:    input.DiscussionID,
			ParentCommentID: comment.ID(),
		})
		if err != nil {
			return fmt.Errorf("failed to list children: %w", err)
		}

		grandparentID, _ := comment.ParentCommentID()

		for _, child := range children {
			if err := child.ChangeParent(grandparentID); err != nil {
				return fmt.Errorf("failed to change parent of child comment: %w", err)
			}
			if err := u.commentRepo.Update(ctx, child); err != nil {
				return fmt.Errorf("failed to update child comment: %w", err)
			}
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
