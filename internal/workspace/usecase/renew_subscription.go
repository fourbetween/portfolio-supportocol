package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type RenewSubscriptionUsecase struct {
	workspaceRepo domain.WorkspaceRepository
	planRepo      domain.PlanRepository
	clockSrv      clock.Service
	tx            dbtx.Manager
}

func NewRenewSubscriptionUsecase(
	workspaceRepo domain.WorkspaceRepository,
	planRepo domain.PlanRepository,
	clockSrv clock.Service,
	tx dbtx.Manager,
) *RenewSubscriptionUsecase {
	return &RenewSubscriptionUsecase{
		workspaceRepo: workspaceRepo,
		planRepo:      planRepo,
		clockSrv:      clockSrv,
		tx:            tx,
	}
}

func (u *RenewSubscriptionUsecase) Execute(ctx context.Context, workspaceIDs ...string) error {
	if len(workspaceIDs) == 0 {
		return nil
	}

	plan, err := u.planRepo.LoadDefault(ctx)
	if err != nil {
		return err
	}

	now := u.clockSrv.Now()

	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		for _, workspaceID := range workspaceIDs {
			workspace, err := u.workspaceRepo.Load(ctx, workspaceID)
			if err != nil {
				return err
			}

			if !workspace.Subscription().IsExpired(now) {
				continue
			}

			workspace.RenewSubscription(plan, now)

			if err := u.workspaceRepo.Save(ctx, workspace); err != nil {
				return err
			}
		}
		return nil
	})
}
