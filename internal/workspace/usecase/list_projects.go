package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type ListProjectsUsecase struct {
	memberRepo  domain.MemberRepository
	projectRepo domain.ProjectRepository
}

func NewListProjectsUsecase(
	memberRepo domain.MemberRepository,
	projectRepo domain.ProjectRepository,
) *ListProjectsUsecase {
	return &ListProjectsUsecase{
		memberRepo:  memberRepo,
		projectRepo: projectRepo,
	}
}

type ListProjectsInput struct {
	WorkspaceID string
	UserID      string
}

func (u *ListProjectsUsecase) Execute(ctx context.Context, input ListProjectsInput) ([]*domain.Project, error) {
	// メンバーシップの確認
	_, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	return u.projectRepo.Search(ctx, domain.SearchProjectsParams{
		WorkspaceID: input.WorkspaceID,
	})
}
