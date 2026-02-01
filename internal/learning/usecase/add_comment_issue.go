package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type AddCommentIssueUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	issueRepo      domain.IssueRepository
	permSv         domain.PermissionService
	tx             dbtx.Manager
}

func NewAddCommentIssueUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	issueRepo domain.IssueRepository,
	permSv domain.PermissionService,
	tx dbtx.Manager,
) *AddCommentIssueUsecase {
	return &AddCommentIssueUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		issueRepo:      issueRepo,
		permSv:         permSv,
		tx:             tx,
	}
}

type AddCommentIssueInput struct {
	WorkspaceID  string
	DiscussionID string
	CommentID    string
	IssueID      string
	UserID       string
}

func (u *AddCommentIssueUsecase) Execute(ctx context.Context, input AddCommentIssueInput) (*domain.Comment, error) {
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

		issue, err := u.issueRepo.Load(ctx, input.IssueID)
		if err != nil {
			return err
		}

		if !comment.AddIssue(issue.ID(), domain.CommentIssueStatusActive) {
			return nil
		}

		return u.commentRepo.Update(ctx, comment)
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
