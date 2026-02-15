package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type AddFavoriteDiscussionUsecase struct {
	memberRepo domain.MemberRepository
	favRepo    domain.FavoriteDiscussionRepository
	favSvc     domain.DiscussionFavoritesService
	clockSrv   clock.Service
}

func NewAddFavoriteDiscussionUsecase(
	memberRepo domain.MemberRepository,
	favRepo domain.FavoriteDiscussionRepository,
	favSvc domain.DiscussionFavoritesService,
	clockSrv clock.Service,
) *AddFavoriteDiscussionUsecase {
	return &AddFavoriteDiscussionUsecase{
		memberRepo: memberRepo,
		favRepo:    favRepo,
		favSvc:     favSvc,
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

	count, err := u.favRepo.CountByMemberID(ctx, member.ID())
	if err != nil {
		return err
	}
	if count >= domain.MaxFavoriteCount {
		return fmt.Errorf("number of favorites has reached the limit: %w", apperr.ErrLimitExceeded)
	}

	fav := domain.FavoriteDiscussion{
		MemberID:     member.ID(),
		DiscussionID: input.DiscussionID,
		CreatedAt:    u.clockSrv.Now(),
	}

	if err := fav.Validate(); err != nil {
		return err
	}

	if err := u.favRepo.Save(ctx, fav); err != nil {
		return err
	}

	return u.favSvc.IncrementFavoritesCount(ctx, input.DiscussionID)
}
