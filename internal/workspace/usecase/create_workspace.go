package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type CreateWorkspaceUsecase struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
	workspaceFac  *domain.WorkspaceFactory
	memberFac     *domain.MemberFactory
	tx            dbtx.Manager
}

func NewCreateWorkspaceUsecase(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
	workspaceFac *domain.WorkspaceFactory,
	memberFac *domain.MemberFactory,
	tx dbtx.Manager,
) *CreateWorkspaceUsecase {
	return &CreateWorkspaceUsecase{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
		workspaceFac:  workspaceFac,
		memberFac:     memberFac,
		tx:            tx,
	}
}

type CreateWorkspaceInput struct {
	Slug   string
	Name   string
	Type   domain.WorkspaceType
	UserID string
}

func (u *CreateWorkspaceUsecase) Execute(ctx context.Context, input CreateWorkspaceInput) (*domain.Workspace, error) {
	var workspace *domain.Workspace
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// スラッグの重複チェック
		existing, err := u.workspaceRepo.LoadBySlug(ctx, input.Slug)
		if err == nil && existing != nil {
			return fmt.Errorf("workspace slug already exists: %w", apperr.ErrAlreadyExists)
		}

		// ワークスペースを作成
		workspace, err = u.workspaceFac.Create(domain.CreateWorkspaceParams{
			Slug: input.Slug,
			Name: input.Name,
			Type: input.Type,
		})
		if err != nil {
			return err
		}

		if err := u.workspaceRepo.Save(ctx, workspace); err != nil {
			return err
		}

		// 作成者をオーナーとして追加
		member, err := u.memberFac.Create(domain.CreateMemberParams{
			WorkspaceID: workspace.ID(),
			UserID:      input.UserID,
			Role:        domain.MemberRoleOwner,
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

	return workspace, nil
}
