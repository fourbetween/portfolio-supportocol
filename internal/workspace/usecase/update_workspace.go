package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type UpdateWorkspaceUsecase struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
	tx            dbtx.Manager
}

func NewUpdateWorkspaceUsecase(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
	tx dbtx.Manager,
) *UpdateWorkspaceUsecase {
	return &UpdateWorkspaceUsecase{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
		tx:            tx,
	}
}

type UpdateWorkspaceInput struct {
	WorkspaceID string
	UserID      string
	Name        string
}

func (u *UpdateWorkspaceUsecase) Execute(ctx context.Context, input UpdateWorkspaceInput) (*domain.Workspace, error) {
	var workspace *domain.Workspace
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// メンバーシップと権限の確認
		member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
		if err != nil {
			return err
		}
		if !member.CanManageWorkspace() {
			return fmt.Errorf("user cannot manage workspace: %w", apperr.ErrPermissionDenied)
		}

		// ワークスペースの取得
		workspace, err = u.workspaceRepo.Load(ctx, input.WorkspaceID)
		if err != nil {
			return err
		}

		// ワークスペースの更新
		if err := workspace.Update(domain.UpdateWorkspaceParams{
			Name: input.Name,
		}); err != nil {
			return err
		}

		if err := u.workspaceRepo.Save(ctx, workspace); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return workspace, nil
}
