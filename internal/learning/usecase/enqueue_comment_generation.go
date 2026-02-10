package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type EnqueueCommentGenerationUsecase struct {
	discussionRepo domain.DiscussionRepository
	permSv         domain.PermissionService
	queue          domain.CommentGenerationQueue
}

func NewEnqueueCommentGenerationUsecase(
	discussionRepo domain.DiscussionRepository,
	permSv domain.PermissionService,
	queue domain.CommentGenerationQueue,
) *EnqueueCommentGenerationUsecase {
	return &EnqueueCommentGenerationUsecase{
		discussionRepo: discussionRepo,
		permSv:         permSv,
		queue:          queue,
	}
}

func (u *EnqueueCommentGenerationUsecase) Execute(ctx context.Context, input GenerateCommentInput) error {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return apperr.ErrPermissionDenied
	}

	// Verify discussion exists and user has access
	discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:          input.DiscussionID,
		WorkspaceID: input.WorkspaceID,
	})
	if err != nil {
		return err
	}

	if discussion.CreatedBy() != input.UserID && !access.CanManage {
		return apperr.ErrPermissionDenied
	}

	if err := discussion.CanAddComment(); err != nil {
		return err
	}

	params := domain.GenerateCommentParams(input)
	return u.queue.Enqueue([]domain.GenerateCommentParams{params})
}
