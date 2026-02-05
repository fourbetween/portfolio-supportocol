package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type ListCommentsUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	permSv         domain.PermissionService
}

func NewListCommentsUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	permSv domain.PermissionService,
) *ListCommentsUsecase {
	return &ListCommentsUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		permSv:         permSv,
	}
}

type ListCommentsInput struct {
	DiscussionID string
	WorkspaceID  string
	Since        *time.Time
}

func (u *ListCommentsUsecase) Execute(ctx context.Context, input ListCommentsInput) ([]*domain.Comment, error) {
	canAccess, err := u.permSv.CanAccessWorkspace(ctx, input.WorkspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	// Verify discussion exists
	_, err = u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:          input.DiscussionID,
		WorkspaceID: input.WorkspaceID,
	})
	if err != nil {
		return nil, err
	}

	return u.commentRepo.Search(ctx, domain.SearchCommentsParams{
		DiscussionID: input.DiscussionID,
		Since:        input.Since,
	})
}
