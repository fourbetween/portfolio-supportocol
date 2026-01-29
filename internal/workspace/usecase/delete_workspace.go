package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type DeleteWorkspaceUsecase struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
	tx            dbtx.Manager
}

func NewDeleteWorkspaceUsecase(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
	tx dbtx.Manager,
) *DeleteWorkspaceUsecase {
	return &DeleteWorkspaceUsecase{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
		tx:            tx,
	}
}

type DeleteWorkspaceInput struct {
	WorkspaceID string
	UserID      string
}

func (u *DeleteWorkspaceUsecase) Execute(ctx context.Context, input DeleteWorkspaceInput) error {
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// メンバーシップと権限の確認（オーナーのみ削除可能）
		member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
		if err != nil {
			return err
		}
		if !member.IsOwner() {
			return fmt.Errorf("only owner can delete workspace: %w", apperr.ErrPermissionDenied)
		}

		// ワークスペースの取得
		workspace, err := u.workspaceRepo.Load(ctx, input.WorkspaceID)
		if err != nil {
			return err
		}

		// ワークスペースの削除（カスケードでメンバー、プロジェクトも削除される）
		if err := u.workspaceRepo.Delete(ctx, workspace); err != nil {
			return err
		}

		return nil
	})
}
