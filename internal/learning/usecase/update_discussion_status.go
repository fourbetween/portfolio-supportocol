package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateDiscussionStatusUsecase struct {
	repo        domain.DiscussionRepository
	commentRepo domain.CommentRepository
	permSv      domain.PermissionService
	tx          dbtx.Manager
}

func NewUpdateDiscussionStatusUsecase(repo domain.DiscussionRepository, commentRepo domain.CommentRepository, permSv domain.PermissionService, tx dbtx.Manager) *UpdateDiscussionStatusUsecase {
	return &UpdateDiscussionStatusUsecase{
		repo:        repo,
		commentRepo: commentRepo,
		permSv:      permSv,
		tx:          tx,
	}
}

type UpdateDiscussionStatusInput struct {
	ID                string
	WorkspaceID       string
	UserID            string
	Status            string
	CommentFrame      *domain.CommentFrame
	CommentPermission domain.PermissionLevel
	IssuePermission   domain.PermissionLevel
}

func (u *UpdateDiscussionStatusUsecase) Execute(ctx context.Context, input UpdateDiscussionStatusInput) (*domain.Discussion, error) {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	isPersonal, err := u.permSv.IsPersonalWorkspace(ctx, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace type: %w", err)
	}
	status := domain.DiscussionStatus(input.Status)
	if status.IsPublic() && !isPersonal {
		return nil, fmt.Errorf("public status is only allowed for personal workspace: %w", apperr.ErrInvalidArgument)
	}
	if status.IsInternal() && isPersonal {
		return nil, fmt.Errorf("internal status is only allowed for organization workspace: %w", apperr.ErrInvalidArgument)
	}

	var discussion *domain.Discussion
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		var err error
		discussion, err = u.repo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.ID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		var commentFrame *domain.CommentFrame
		if status.IsPublic() {
			var err error
			commentFrame, err = u.resolveCommentFrame(ctx, input.ID, input.CommentFrame)
			if err != nil {
				return err
			}
		}

		if err := discussion.UpdateStatus(domain.UpdateStatusParams{
			Status:            status,
			CommentFrame:      commentFrame,
			CommentPermission: input.CommentPermission,
			IssuePermission:   input.IssuePermission,
		}); err != nil {
			return err
		}

		if err := u.repo.Save(ctx, discussion); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return discussion, nil
}

func (u *UpdateDiscussionStatusUsecase) resolveCommentFrame(ctx context.Context, discussionID string, baseFrame *domain.CommentFrame) (*domain.CommentFrame, error) {
	if baseFrame == nil {
		return nil, nil
	}

	comments, err := u.commentRepo.Search(ctx, domain.SearchCommentsParams{
		DiscussionID: discussionID,
	})
	if err != nil {
		return nil, err
	}

	cf := baseFrame.Supplement(comments)
	return &cf, nil
}
