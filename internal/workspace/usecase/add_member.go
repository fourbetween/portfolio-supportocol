package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type AddMemberUsecase struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
	memberFac     *domain.MemberFactory
	tx            dbtx.Manager
}

func NewAddMemberUsecase(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
	memberFac *domain.MemberFactory,
	tx dbtx.Manager,
) *AddMemberUsecase {
	return &AddMemberUsecase{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
		memberFac:     memberFac,
		tx:            tx,
	}
}

type AddMemberInput struct {
	WorkspaceID  string
	UserID       string
	TargetUserID string
	TargetRole   domain.MemberRole
}

func (u *AddMemberUsecase) Execute(ctx context.Context, input AddMemberInput) (*domain.Member, error) {
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

		// オーナー権限の付与は、オーナーのみが可能
		if input.TargetRole.IsOwner() && !operatorMember.IsOwner() {
			return fmt.Errorf("only owner can add owner: %w", apperr.ErrPermissionDenied)
		}

		// ワークスペースの存在確認
		_, err = u.workspaceRepo.Load(ctx, input.WorkspaceID)
		if err != nil {
			return err
		}

		// 既存メンバーのチェック
		existing, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.TargetUserID)
		if err == nil && existing != nil {
			return fmt.Errorf("user is already a member: %w", apperr.ErrAlreadyExists)
		}

		// メンバーの作成
		member, err = u.memberFac.Create(domain.CreateMemberParams{
			WorkspaceID: input.WorkspaceID,
			UserID:      input.TargetUserID,
			Role:        input.TargetRole,
		})
		if err != nil {
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
