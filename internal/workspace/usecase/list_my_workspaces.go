package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
)

type ListMyWorkspacesUsecase struct {
	queryService         WorkspaceQueryService
	renewSubscriptionUsc *RenewSubscriptionUsecase
	clockSrv             clock.Service
}

func NewListMyWorkspacesUsecase(
	queryService WorkspaceQueryService,
	renewSubscriptionUsc *RenewSubscriptionUsecase,
	clockSrv clock.Service,
) *ListMyWorkspacesUsecase {
	return &ListMyWorkspacesUsecase{
		queryService:         queryService,
		renewSubscriptionUsc: renewSubscriptionUsc,
		clockSrv:             clockSrv,
	}
}

func (u *ListMyWorkspacesUsecase) Execute(ctx context.Context, userID string) ([]WorkspaceWithMember, error) {
	workspaces, err := u.queryService.ListMyWorkspaces(ctx, userID)
	if err != nil {
		return nil, err
	}

	now := u.clockSrv.Now()
	var expiredIDs []string
	for _, w := range workspaces {
		if now.After(w.CurrentPeriodEnd) {
			expiredIDs = append(expiredIDs, w.WorkspaceID)
		}
	}

	if len(expiredIDs) == 0 {
		return workspaces, nil
	}

	if err := u.renewSubscriptionUsc.Execute(ctx, expiredIDs...); err != nil {
		return nil, err
	}

	return u.queryService.ListMyWorkspaces(ctx, userID)
}
