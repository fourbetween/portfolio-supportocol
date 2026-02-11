package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type RemoveFavoriteDiscussionUsecase struct {
	memberRepo domain.MemberRepository
	favRepo    domain.FavoriteDiscussionRepository
}

func NewRemoveFavoriteDiscussionUsecase(
	memberRepo domain.MemberRepository,
	favRepo domain.FavoriteDiscussionRepository,
) *RemoveFavoriteDiscussionUsecase {
	return &RemoveFavoriteDiscussionUsecase{
		memberRepo: memberRepo,
		favRepo:    favRepo,
	}
}

type RemoveFavoriteDiscussionInput struct {
	WorkspaceID  string
	DiscussionID string
	UserID       string
}

func (u *RemoveFavoriteDiscussionUsecase) Execute(ctx context.Context, input RemoveFavoriteDiscussionInput) error {
	// メンバーシップの確認
	member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
	if err != nil {
		return err
	}

	return u.favRepo.Delete(ctx, member.ID(), input.DiscussionID)
}
