package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type GetWorkspaceUsecase struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
}

func NewGetWorkspaceUsecase(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
) *GetWorkspaceUsecase {
	return &GetWorkspaceUsecase{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
	}
}

type GetWorkspaceInput struct {
	WorkspaceID string
	UserID      string
}

func (u *GetWorkspaceUsecase) Execute(ctx context.Context, input GetWorkspaceInput) (*domain.Workspace, *domain.Member, error) {
	// メンバーシップの確認
	member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, nil, err
	}

	// ワークスペースの取得
	workspace, err := u.workspaceRepo.Load(ctx, input.WorkspaceID)
	if err != nil {
		return nil, nil, err
	}

	return workspace, member, nil
}
