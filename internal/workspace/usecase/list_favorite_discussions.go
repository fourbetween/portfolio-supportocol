package usecase

import (
	"context"
)

type ListFavoriteDiscussionsUsecase struct {
	qs WorkspaceQueryService
}

func NewListFavoriteDiscussionsUsecase(qs WorkspaceQueryService) *ListFavoriteDiscussionsUsecase {
	return &ListFavoriteDiscussionsUsecase{qs: qs}
}

type ListFavoriteDiscussionsInput struct {
	WorkspaceID string
	UserID      string
}

func (u *ListFavoriteDiscussionsUsecase) Execute(ctx context.Context, input ListFavoriteDiscussionsInput) ([]FavoriteDiscussionSummary, error) {
	return u.qs.ListFavoriteDiscussions(ctx, input.WorkspaceID, input.UserID)
}
