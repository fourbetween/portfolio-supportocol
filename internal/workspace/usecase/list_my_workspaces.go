package usecase

import (
	"context"
)

type ListMyWorkspacesUsecase struct {
	queryService WorkspaceQueryService
}

func NewListMyWorkspacesUsecase(
	queryService WorkspaceQueryService,
) *ListMyWorkspacesUsecase {
	return &ListMyWorkspacesUsecase{
		queryService: queryService,
	}
}

func (u *ListMyWorkspacesUsecase) Execute(ctx context.Context, userID string) ([]WorkspaceWithMember, error) {
	return u.queryService.ListMyWorkspaces(ctx, userID)
}
