package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type UpdateMemberUsecase struct {
	memberRepo domain.MemberRepository
	tx         dbtx.Manager
}

func NewUpdateMemberUsecase(
	memberRepo domain.MemberRepository,
	tx dbtx.Manager,
) *UpdateMemberUsecase {
	return &UpdateMemberUsecase{
		memberRepo: memberRepo,
		tx:         tx,
	}
}

type UpdateMemberInput struct {
	WorkspaceID  string
	UserID       string
	TargetUserID string
	TargetRole   domain.MemberRole
}

func (u *UpdateMemberUsecase) Execute(ctx context.Context, input UpdateMemberInput) (*domain.Member, error) {
	var member *domain.Member
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// 操作ユーザーのメンバーシップと権限の確認
		operatorMember, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
		if err != nil {
			return err
		}
		if !operatorMember.CanManageMembers() {
			return fmt.Errorf("user cannot manage members: %w", apperr.ErrPermissionDenied)
		}

		// オーナー権限の変更は、オーナーのみが可能
		if input.TargetRole.IsOwner() && !operatorMember.IsOwner() {
			return fmt.Errorf("only owner can set owner role: %w", apperr.ErrPermissionDenied)
		}

		// 対象メンバーの取得
		member, err = u.memberRepo.Load(ctx, input.WorkspaceID, input.TargetUserID)
		if err != nil {
			return err
		}

		// オーナーの権限を変更する場合、オーナー自身のみが可能
		if member.IsOwner() && !operatorMember.IsOwner() {
			return fmt.Errorf("only owner can change owner's role: %w", apperr.ErrPermissionDenied)
		}

		// メンバーの更新
		if err := member.Update(domain.UpdateMemberParams{
			Role: input.TargetRole,
		}); err != nil {
			return err
		}

		if err := u.memberRepo.Save(ctx, member); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return member, nil
}
