package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type GetProjectUsecase struct {
	memberRepo  domain.MemberRepository
	projectRepo domain.ProjectRepository
}

func NewGetProjectUsecase(
	memberRepo domain.MemberRepository,
	projectRepo domain.ProjectRepository,
) *GetProjectUsecase {
	return &GetProjectUsecase{
		memberRepo:  memberRepo,
		projectRepo: projectRepo,
	}
}

type GetProjectInput struct {
	WorkspaceID string
	ProjectID   string
	UserID      string
}

func (u *GetProjectUsecase) Execute(ctx context.Context, input GetProjectInput) (*domain.Project, error) {
	// メンバーシップの確認
	_, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
	if err != nil {
		return nil, err
	}

	return u.projectRepo.Load(ctx, domain.LoadProjectParams{
		ID:          input.ProjectID,
		WorkspaceID: input.WorkspaceID,
	})
}
