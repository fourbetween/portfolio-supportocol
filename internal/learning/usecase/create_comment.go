package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type CreateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	fac            *domain.CommentFactory
	permSv         domain.PermissionService
	clock          clock.Service
	tx             dbtx.Manager
	auditSv        domain.AuditService
}

func NewCreateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	fac *domain.CommentFactory,
	permSv domain.PermissionService,
	clock clock.Service,
	tx dbtx.Manager,
	auditSv domain.AuditService,
) *CreateCommentUsecase {
	return &CreateCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		fac:            fac,
		permSv:         permSv,
		clock:          clock,
		tx:             tx,
		auditSv:        auditSv,
	}
}

type CreateCommentInput struct {
	DiscussionID    string
	WorkspaceID     string
	ParentCommentID *string
	CommentType     string
	Content         string
	UserID          string
}

func (u *CreateCommentUsecase) Execute(ctx context.Context, input CreateCommentInput) (*domain.Comment, error) {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return nil, apperr.ErrPermissionDenied
	}

	var comment *domain.Comment
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// Verify discussion exists and user has access
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

		if err := discussion.CanAddComment(); err != nil {
			return err
		}

		var parentType string
		if discussion.Status().IsPublic() && input.ParentCommentID != nil {
			parent, err := u.commentRepo.Load(ctx, *input.ParentCommentID)
			if err != nil {
				return err
			}
			parentType = parent.Type()
		}

		var createErr error
		comment, createErr = u.fac.Create(domain.CreateCommentParams{
			DiscussionID:    input.DiscussionID,
			ParentCommentID: input.ParentCommentID,
			Body: domain.CommentBody{
				Type:    input.CommentType,
				Content: input.Content,
			},
			Status:    domain.CommentStatusActive,
			CreatedBy: &input.UserID,
		})
		if createErr != nil {
			return createErr
		}

		if err := u.commentRepo.Create(ctx, comment); err != nil {
			return err
		}

		discussion.EnsureCommentFrameRequirement(comment.Type(), parentType)
		discussion.AddComment(u.clock.Now())
		return u.discussionRepo.Save(ctx, discussion)
	})
	if err != nil {
		return nil, err
	}

	u.auditSv.LogCommentCreated(ctx, comment)

	return comment, nil
}
