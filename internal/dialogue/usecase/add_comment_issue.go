package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type AddCommentIssueUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	idSrv          id.Service
	tx             dbtx.Manager
	permSv         domain.PermissionService
	auditSv        domain.AuditService
}

func NewAddCommentIssueUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	idSrv id.Service,
	tx dbtx.Manager,
	permSv domain.PermissionService,
	auditSv domain.AuditService,
) *AddCommentIssueUsecase {
	return &AddCommentIssueUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		idSrv:          idSrv,
		tx:             tx,
		permSv:         permSv,
		auditSv:        auditSv,
	}
}

type AddCommentIssueInput struct {
	DiscussionID string
	WorkspaceID  string
	CommentID    string
	Title        string
	Description  string
	UserID       string
}

func (u *AddCommentIssueUsecase) Execute(ctx context.Context, input AddCommentIssueInput) (*domain.Comment, error) {
	var comment *domain.Comment
	var addedIssue domain.CommentIssue
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.DiscussionID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		canAccess, err := u.permSv.CanAccessDiscussion(ctx, input.UserID, input.WorkspaceID, discussion.Status())
		if err != nil {
			return fmt.Errorf("failed to check discussion access: %w", err)
		}
		if !canAccess {
			return apperr.ErrPermissionDenied
		}

		if !discussion.Settings().IssuePermission.CanPerform(input.UserID) {
			return fmt.Errorf("issue permission denied: %w", apperr.ErrPermissionDenied)
		}

		comment, err = u.commentRepo.Load(ctx, input.CommentID)
		if err != nil {
			return err
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		addedIssue = domain.CommentIssue{
			ID:          u.idSrv.Generate(),
			Title:       input.Title,
			Description: input.Description,
			CreatedBy:   input.UserID,
		}
		comment.AddIssue(addedIssue)

		if err := u.commentRepo.Update(ctx, comment); err != nil {
			return err
		}

		discussion.AddCommentIssue()
		return u.discussionRepo.Save(ctx, discussion)
	})
	if err != nil {
		return nil, err
	}

	u.auditSv.LogCommentIssueAdded(ctx, comment, addedIssue)

	return comment, nil
}
