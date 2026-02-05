package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type CreateCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	fac            *domain.CommentFactory
	clock          clock.Service
	tx             dbtx.Manager
	permSv         domain.PermissionService
}

func NewCreateCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	fac *domain.CommentFactory,
	clock clock.Service,
	tx dbtx.Manager,
	permSv domain.PermissionService,
) *CreateCommentUsecase {
	return &CreateCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		fac:            fac,
		clock:          clock,
		tx:             tx,
		permSv:         permSv,
	}
}

type CreateCommentInput struct {
	DiscussionID    string
	WorkspaceID     string
	ParentCommentID *string
	CommentType     string
	Content         string
}

func (u *CreateCommentUsecase) Execute(ctx context.Context, input CreateCommentInput) (*domain.Comment, error) {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	var comment *domain.Comment
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// Verify discussion exists
		discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.DiscussionID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		var parent *domain.Comment
		if input.ParentCommentID != nil {
			path, err := u.commentRepo.GetPathToRoot(ctx, *input.ParentCommentID)
			if err != nil {
				return err
			}
			for _, c := range path {
				if err := c.CanAddChild(); err != nil {
					return err
				}
			}

			parent, err = u.commentRepo.Load(ctx, *input.ParentCommentID)
			if err != nil {
				return err
			}
		}

		if err := discussion.ValidateComment(input.CommentType, parent); err != nil {
			return err
		}

		var createErr error
		comment, createErr = u.fac.Create(domain.CreateCommentParams{
			DiscussionID:    input.DiscussionID,
			ParentCommentID: input.ParentCommentID,
			CommentTypeID:   input.CommentType,
			Content:         input.Content,
			Status:          domain.CommentStatusProposed,
		})
		if createErr != nil {
			return createErr
		}

		if err := u.commentRepo.Create(ctx, comment); err != nil {
			return err
		}

		discussion.AddComment(u.clock.Now())
		return u.discussionRepo.Save(ctx, discussion)
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
