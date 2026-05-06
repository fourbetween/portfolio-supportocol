package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type GenerateChildCommentsUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	generator      domain.CommentGenerator
	permSv         domain.PermissionService
	aiUsageSv      domain.AIUsageService
	clock          clock.Service
	tx             dbtx.Manager
}

func NewGenerateChildCommentsUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	generator domain.CommentGenerator,
	permSv domain.PermissionService,
	aiUsageSv domain.AIUsageService,
	clock clock.Service,
	tx dbtx.Manager,
) *GenerateChildCommentsUsecase {
	return &GenerateChildCommentsUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		generator:      generator,
		permSv:         permSv,
		aiUsageSv:      aiUsageSv,
		clock:          clock,
		tx:             tx,
	}
}

type GenerateChildCommentsInput struct {
	DiscussionID    string
	WorkspaceID     string
	ParentCommentID string
	CommentType     string
	UserID          string
}

func (u *GenerateChildCommentsUsecase) Execute(ctx context.Context, input GenerateChildCommentsInput) ([]*domain.Comment, error) {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return nil, apperr.ErrPermissionDenied
	}

	discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:          input.DiscussionID,
		WorkspaceID: input.WorkspaceID,
	})
	if err != nil {
		return nil, err
	}

	if !discussion.IsCreatedBy(input.UserID) && !access.CanManage {
		return nil, apperr.ErrPermissionDenied
	}

	if err := discussion.CanAddComment(); err != nil {
		return nil, err
	}

	if err := u.aiUsageSv.CheckCommentGenerationLimit(ctx, input.WorkspaceID); err != nil {
		return nil, err
	}

	result, err := u.generator.GenerateChildComments(ctx, domain.GenerateChildCommentsParams{
		DiscussionID:    input.DiscussionID,
		WorkspaceID:     input.WorkspaceID,
		ParentCommentID: input.ParentCommentID,
		CommentType:     input.CommentType,
		UserID:          input.UserID,
	})
	if err != nil {
		return nil, err
	}

	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		if err := u.commentRepo.BatchCreate(ctx, result.Comments); err != nil {
			return err
		}

		discussion.AddComments(len(result.Comments), u.clock.Now())
		if err := u.discussionRepo.Save(ctx, discussion); err != nil {
			return err
		}

		return u.aiUsageSv.RecordCommentGeneration(ctx, input.WorkspaceID, input.DiscussionID, result.Tokens)
	})
	if err != nil {
		return nil, err
	}

	return result.Comments, nil
}
