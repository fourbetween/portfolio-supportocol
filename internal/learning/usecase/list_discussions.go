package usecase

import (
	"context"
)

type ListDiscussionsUsecase struct {
	qs DiscussionQueryService
}

func NewListDiscussionsUsecase(qs DiscussionQueryService) *ListDiscussionsUsecase {
	return &ListDiscussionsUsecase{
		qs: qs,
	}
}

func (u *ListDiscussionsUsecase) Execute(ctx context.Context, createdBy string) ([]*DiscussionSummary, error) {
	return u.qs.ListDiscussions(ctx, createdBy)
}
