package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateCommentIssueStatusUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	permSv         domain.PermissionService
	tx             dbtx.Manager
}

func NewUpdateCommentIssueStatusUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	permSv domain.PermissionService,
	tx dbtx.Manager,
) *UpdateCommentIssueStatusUsecase {
	return &UpdateCommentIssueStatusUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		permSv:         permSv,
		tx:             tx,
	}
}

type UpdateCommentIssueStatusInput struct {
	WorkspaceID  string
	DiscussionID string
	CommentID    string
	IssueID      string
	Status       domain.CommentIssueStatus
	UserID       string
}

func (u *UpdateCommentIssueStatusUsecase) Execute(ctx context.Context, input UpdateCommentIssueStatusInput) (*domain.Comment, error) {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, err
	}
	if !canAccess {
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

		comment, err = u.commentRepo.Load(ctx, input.CommentID)
		if err != nil {
			return err
		}

		if err := comment.CheckBelongsTo(discussion.ID()); err != nil {
			return err
		}

		updated, err := comment.UpdateIssueStatus(input.IssueID, input.Status)
		if err != nil {
			return err
		}
		if !updated {
			return nil
		}

		return u.commentRepo.Update(ctx, comment)
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
