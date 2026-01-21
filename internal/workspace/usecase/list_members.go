package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type ListMembersUsecase struct {
	memberRepo domain.MemberRepository
}

func NewListMembersUsecase(
	memberRepo domain.MemberRepository,
) *ListMembersUsecase {
	return &ListMembersUsecase{
		memberRepo: memberRepo,
	}
}

type ListMembersInput struct {
	WorkspaceID string
	UserID      string
}

func (u *ListMembersUsecase) Execute(ctx context.Context, input ListMembersInput) ([]*domain.Member, error) {
	// メンバーシップの確認
	_, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	return u.memberRepo.Search(ctx, domain.SearchMembersParams{
		WorkspaceID: input.WorkspaceID,
	})
}
