package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type AddCommentIssueUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	idSrv          id.Service
	tx             dbtx.Manager
}

func NewAddCommentIssueUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	idSrv id.Service,
	tx dbtx.Manager,
) *AddCommentIssueUsecase {
	return &AddCommentIssueUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		idSrv:          idSrv,
		tx:             tx,
	}
}

type AddCommentIssueInput struct {
	DiscussionID string
	CommentID    string
	Title        string
	Description  string
}

func (u *AddCommentIssueUsecase) Execute(ctx context.Context, input AddCommentIssueInput) (*domain.Comment, error) {
	var comment *domain.Comment
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID: input.DiscussionID,
		})
		if err != nil {
			return err
		}

		comment, err = u.commentRepo.Load(ctx, input.CommentID)
		if err != nil {
			return err
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		comment.AddIssue(domain.CommentIssue{
			ID:          u.idSrv.Generate(),
			Title:       input.Title,
			Description: input.Description,
		})

		return u.commentRepo.Update(ctx, comment)
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
