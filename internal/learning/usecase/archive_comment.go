package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type ArchiveCommentUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	tx             dbtx.Manager
	clock          clock.Service
}

func NewArchiveCommentUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	tx dbtx.Manager,
	clock clock.Service,
) *ArchiveCommentUsecase {
	return &ArchiveCommentUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		tx:             tx,
		clock:          clock,
	}
}

type ArchiveCommentInput struct {
	ID           string
	DiscussionID string
	UserID       string
}

func (u *ArchiveCommentUsecase) Execute(ctx context.Context, input ArchiveCommentInput) (*domain.Comment, error) {
	var comment *domain.Comment
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// Verify discussion exists and user has access
		_, err := u.discussionRepo.Load(ctx, domain.LoadDiscussionParams{
			ID:        input.DiscussionID,
			CreatedBy: input.UserID,
		})
		if err != nil {
			return err
		}

		comment, err = u.commentRepo.Load(ctx, input.ID)
		if err != nil {
			return err
		}

		if err := comment.CheckBelongsTo(input.DiscussionID); err != nil {
			return err
		}

		if err := comment.Archive(u.clock.Now()); err != nil {
			return err
		}

		if err := u.commentRepo.Update(ctx, comment); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return comment, nil
}
