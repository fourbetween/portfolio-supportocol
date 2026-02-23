package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type AddFavoriteDiscussionUsecase struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
	favRepo       domain.FavoriteDiscussionRepository
	favSvc        domain.DiscussionFavoritesService
	clockSrv      clock.Service
}

func NewAddFavoriteDiscussionUsecase(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
	favRepo domain.FavoriteDiscussionRepository,
	favSvc domain.DiscussionFavoritesService,
	clockSrv clock.Service,
) *AddFavoriteDiscussionUsecase {
	return &AddFavoriteDiscussionUsecase{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
		favRepo:       favRepo,
		favSvc:        favSvc,
		clockSrv:      clockSrv,
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

	// ワークスペースの確認
	workspace, err := u.workspaceRepo.Load(ctx, input.WorkspaceID)
	if err != nil {
		return err
	}

	count, err := u.favRepo.CountByMemberID(ctx, member.ID())
	if err != nil {
		return err
	}
	if err := workspace.CanAddFavorite(count); err != nil {
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

	if err := u.favRepo.Save(ctx, fav); err != nil {
		return err
	}

	return u.favSvc.IncrementFavoritesCount(ctx, input.DiscussionID)
}
