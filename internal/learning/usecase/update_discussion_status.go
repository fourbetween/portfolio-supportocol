package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type UpdateDiscussionStatusUsecase struct {
	repo        domain.DiscussionRepository
	commentRepo domain.CommentRepository
	tx          dbtx.Manager
}

func NewUpdateDiscussionStatusUsecase(repo domain.DiscussionRepository, commentRepo domain.CommentRepository, tx dbtx.Manager) *UpdateDiscussionStatusUsecase {
	return &UpdateDiscussionStatusUsecase{
		repo:        repo,
		commentRepo: commentRepo,
		tx:          tx,
	}
}

type UpdateDiscussionStatusInput struct {
	ID           string
	CreatedBy    string
	Status       string
	CommentFrame *domain.CommentFrame
}

func (u *UpdateDiscussionStatusUsecase) Execute(ctx context.Context, input UpdateDiscussionStatusInput) (*domain.Discussion, error) {
	var discussion *domain.Discussion
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		var err error
		discussion, err = u.repo.Load(ctx, domain.LoadDiscussionParams{
			ID:        input.ID,
			CreatedBy: input.CreatedBy,
		})
		if err != nil {
			return err
		}

		commentFrame := input.CommentFrame
		if input.CommentFrame != nil {
			comments, err := u.commentRepo.Search(ctx, domain.SearchCommentsParams{
				DiscussionID: input.ID,
			})
			if err != nil {
				return err
			}
			cf := input.CommentFrame.Supplement(comments)
			commentFrame = &cf
		}

		if err := discussion.UpdateStatus(domain.UpdateStatusParams{
			Status:       domain.DiscussionStatus(input.Status),
			CommentFrame: commentFrame,
		}); err != nil {
			return err
		}

		if err := u.repo.Save(ctx, discussion); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return discussion, nil
}
