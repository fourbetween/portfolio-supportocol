package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type MoveCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	permSv         domain.PermissionService
	tx             dbtx.Manager
	auditSv        domain.AuditService
}

func NewMoveCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	permSv domain.PermissionService,
	tx dbtx.Manager,
	auditSv domain.AuditService,
) *MoveCommentUsecase {
	return &MoveCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		permSv:         permSv,
		tx:             tx,
		auditSv:        auditSv,
	}
}

type MoveCommentInput struct {
	ID              string
	DiscussionID    string
	WorkspaceID     string
	ParentCommentID *string
	UserID          string
}

func (u *MoveCommentUsecase) Execute(ctx context.Context, input MoveCommentInput) (*domain.Comment, error) {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return nil, apperr.ErrPermissionDenied
	}

	var comment *domain.Comment
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
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

		comment, err = u.commentRepo.Load(ctx, input.ID)
		if err != nil {
			return err
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		var parentType string
		if input.ParentCommentID != nil {
			parent, err := u.commentRepo.Load(ctx, *input.ParentCommentID)
			if err != nil {
				return err
			}
			if err := parent.CheckBelongsTo(input.DiscussionID); err != nil {
				return err
			}

			pathToRoot, err := u.commentRepo.GetPathToRoot(ctx, parent.ID())
			if err != nil {
				return err
			}
			for _, ancestor := range pathToRoot {
				if ancestor.ID() == comment.ID() {
					return apperr.ErrInvalidArgument
				}
			}

			parentType = parent.Type()
		}

		if err := comment.ChangeParent(input.ParentCommentID); err != nil {
			return err
		}

		if err := u.commentRepo.Update(ctx, comment); err != nil {
			return err
		}

		discussion.EnsureCommentFrameRequirement(comment.Type(), parentType)
		return u.discussionRepo.Save(ctx, discussion)
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
