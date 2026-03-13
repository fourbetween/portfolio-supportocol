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
	UserID       string
	Since        *time.Time
}

type ListCommentsOutput struct {
	Items []*domain.Comment
	ReadCachePolicy
}

func (u *ListCommentsUsecase) Execute(ctx context.Context, input ListCommentsInput) (*ListCommentsOutput, error) {
	discussion, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
		ID:          input.DiscussionID,
		WorkspaceID: input.WorkspaceID,
	})
	if err != nil {
		return nil, err
	}

	canAccess, err := u.permSv.CanAccessDiscussion(ctx, input.UserID, input.WorkspaceID, discussion.Status())
	if err != nil {
		return nil, fmt.Errorf("failed to check discussion access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	items, err := u.commentRepo.Search(ctx, domain.SearchCommentsParams{
		DiscussionID: input.DiscussionID,
		Since:        input.Since,
	})
	if err != nil {
		return nil, err
	}

	return &ListCommentsOutput{
		Items:           items,
		ReadCachePolicy: ReadCachePolicy{Cacheable: discussion.Status().IsPublic()},
	}, nil
}
