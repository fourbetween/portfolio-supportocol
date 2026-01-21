package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type RemoveMemberUsecase struct {
	memberRepo domain.MemberRepository
	tx         dbtx.Manager
}

func NewRemoveMemberUsecase(
	memberRepo domain.MemberRepository,
	tx dbtx.Manager,
) *RemoveMemberUsecase {
	return &RemoveMemberUsecase{
		memberRepo: memberRepo,
		tx:         tx,
	}
}

type RemoveMemberInput struct {
	WorkspaceID  string
	UserID       string
	TargetUserID string
}

func (u *RemoveMemberUsecase) Execute(ctx context.Context, input RemoveMemberInput) error {
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// 操作ユーザーのメンバーシップと権限の確認
		operatorMember, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
		if err != nil {
			return err
		}

		// 自分自身を削除する場合は権限チェック不要
		isSelf := input.UserID == input.TargetUserID
		if !isSelf && !operatorMember.CanManageMembers() {
			return fmt.Errorf("user cannot manage members: %w", apperr.ErrPermissionDenied)
		}

		// 対象メンバーの取得
		member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.TargetUserID)
		if err != nil {
			return err
		}

		// オーナーは削除できない（オーナーを削除するにはワークスペースを削除する必要がある）
		if member.IsOwner() {
			return fmt.Errorf("cannot remove owner from workspace: %w", apperr.ErrPermissionDenied)
		}

		// メンバーの削除
		if err := u.memberRepo.Delete(ctx, member); err != nil {
			return err
		}

		return nil
	})
}
