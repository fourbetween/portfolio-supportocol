package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type ListWorkspacesUsecase struct {
	workspaceRepo domain.WorkspaceRepository
}

func NewListWorkspacesUsecase(
	workspaceRepo domain.WorkspaceRepository,
) *ListWorkspacesUsecase {
	return &ListWorkspacesUsecase{
		workspaceRepo: workspaceRepo,
	}
}

func (u *ListWorkspacesUsecase) Execute(ctx context.Context, userID string) ([]*domain.Workspace, error) {
	return u.workspaceRepo.Search(ctx, domain.SearchWorkspacesParams{
		UserID: userID,
	})
}
