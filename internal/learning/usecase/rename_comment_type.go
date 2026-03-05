package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type RenameCommentTypeUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	permSv         domain.PermissionService
	tx             dbtx.Manager
	auditSv        domain.AuditService
}

func NewRenameCommentTypeUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	permSv domain.PermissionService,
	tx dbtx.Manager,
	auditSv domain.AuditService,
) *RenameCommentTypeUsecase {
	return &RenameCommentTypeUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		permSv:         permSv,
		tx:             tx,
		auditSv:        auditSv,
	}
}

type RenameCommentTypeInput struct {
	DiscussionID string
	WorkspaceID  string
	UserID       string
	OldType      string
	NewType      string
}

func (u *RenameCommentTypeUsecase) Execute(ctx context.Context, input RenameCommentTypeInput) error {
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

		if err := discussion.RenameCommentType(input.OldType, input.NewType); err != nil {
			return err
		}

		if err := u.commentRepo.RenameCommentType(ctx, input.DiscussionID, input.OldType, input.NewType); err != nil {
			return fmt.Errorf("failed to rename comment type: %w", err)
		}

		if err := u.discussionRepo.Save(ctx, discussion); err != nil {
			return err
		}

		u.auditSv.LogDiscussionUpdated(ctx, discussion)
		return nil
	})
}
