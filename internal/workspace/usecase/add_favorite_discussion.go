package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type AddFavoriteDiscussionUsecase struct {
	memberRepo domain.MemberRepository
	favRepo    domain.FavoriteDiscussionRepository
	clockSrv   clock.Service
}

func NewAddFavoriteDiscussionUsecase(
	memberRepo domain.MemberRepository,
	favRepo domain.FavoriteDiscussionRepository,
	clockSrv clock.Service,
) *AddFavoriteDiscussionUsecase {
	return &AddFavoriteDiscussionUsecase{
		memberRepo: memberRepo,
		favRepo:    favRepo,
		clockSrv:   clockSrv,
	}
}

type AddFavoriteDiscussionInput struct {
	WorkspaceID  string
	DiscussionID string
	UserID       string
}

func (u *AddFavoriteDiscussionUsecase) Execute(ctx context.Context, input AddFavoriteDiscussionInput) error {
	// メンバーシップの確認
	member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
	if err != nil {
		return err
	}

	fav := domain.FavoriteDiscussion{
		MemberID:     member.ID(),
		DiscussionID: input.DiscussionID,
		CreatedAt:    u.clockSrv.Now(),
	}

	if err := fav.Validate(); err != nil {
		return err
	}

	return u.favRepo.Save(ctx, fav)
}
