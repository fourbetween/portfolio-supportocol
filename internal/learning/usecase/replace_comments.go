package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type ReplaceCommentsUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	fac            *domain.CommentFactory
	permSv         domain.PermissionService
	clock          clock.Service
	tx             dbtx.Manager
	auditSv        domain.AuditService
}

func NewReplaceCommentsUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	fac *domain.CommentFactory,
	permSv domain.PermissionService,
	clock clock.Service,
	tx dbtx.Manager,
	auditSv domain.AuditService,
) *ReplaceCommentsUsecase {
	return &ReplaceCommentsUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		fac:            fac,
		permSv:         permSv,
		clock:          clock,
		tx:             tx,
		auditSv:        auditSv,
	}
}

type ReplaceCommentItem struct {
	ParentIndex *int
	CommentType string
	Content     string
}

type ReplaceCommentsInput struct {
	DiscussionID string
	WorkspaceID  string
	UserID       string
	Comments     []ReplaceCommentItem
}

func (u *ReplaceCommentsUsecase) Execute(ctx context.Context, input ReplaceCommentsInput) ([]*domain.Comment, error) {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return nil, apperr.ErrPermissionDenied
	}

	var comments []*domain.Comment
	var discussion *domain.Discussion
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		var err error
		discussion, err = u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:          input.DiscussionID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		if !discussion.IsCreatedBy(input.UserID) && !access.CanManage {
			return apperr.ErrPermissionDenied
		}

		if err := discussion.CanReplaceComments(len(input.Comments)); err != nil {
			return err
		}

		comments = make([]*domain.Comment, len(input.Comments))
		for i, item := range input.Comments {
			var parentCommentID *string
			if item.ParentIndex != nil {
				idx := *item.ParentIndex
				if idx < 0 || idx >= i {
					return fmt.Errorf("invalid parent index %d for comment at index %d: %w", idx, i, apperr.ErrInvalidArgument)
				}
				id := comments[idx].ID()
				parentCommentID = &id
			}

			comment, err := u.fac.Create(domain.CreateCommentParams{
				DiscussionID:    input.DiscussionID,
				ParentCommentID: parentCommentID,
				Body: domain.CommentBody{
					Type:    item.CommentType,
					Content: item.Content,
				},
				Status:    domain.CommentStatusActive,
				CreatedBy: &input.UserID,
			})
			if err != nil {
				return err
			}
			comments[i] = comment
		}

		if err := u.commentRepo.DeleteByDiscussionID(ctx, input.DiscussionID); err != nil {
			return err
		}

		if err := u.commentRepo.BatchCreate(ctx, comments); err != nil {
			return err
		}

		discussion.ReplaceComments(comments, u.clock.Now())
		return u.discussionRepo.Save(ctx, discussion)
	})
	if err != nil {
		return nil, err
	}

	u.auditSv.LogDiscussionUpdated(ctx, discussion)

	return comments, nil
}
