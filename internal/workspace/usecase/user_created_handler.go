package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type UserCreatedHandler struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
	projectRepo   domain.ProjectRepository
	workspaceFac  *domain.WorkspaceFactory
	memberFac     *domain.MemberFactory
	projectFac    *domain.ProjectFactory
	tx            dbtx.Manager
}

func NewUserCreatedHandler(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
	projectRepo domain.ProjectRepository,
	workspaceFac *domain.WorkspaceFactory,
	memberFac *domain.MemberFactory,
	projectFac *domain.ProjectFactory,
	tx dbtx.Manager,
) *UserCreatedHandler {
	return &UserCreatedHandler{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
		projectRepo:   projectRepo,
		workspaceFac:  workspaceFac,
		memberFac:     memberFac,
		projectFac:    projectFac,
		tx:            tx,
	}
}

func (h *UserCreatedHandler) OnUserCreated(ctx context.Context, userID string) error {
	return h.tx.RunInTx(ctx, func(ctx context.Context) error {
		// 1. パーソナルワークスペースの作成
		workspace, err := h.workspaceFac.Create(domain.CreateWorkspaceParams{
			Slug: "personal-" + userID,
			Name: "個人用ワークスペース",
			Type: domain.WorkspaceTypePersonal,
		})
		if err != nil {
			return err
		}
		if err := h.workspaceRepo.Save(ctx, workspace); err != nil {
			return err
		}

		// 2. メンバー（オーナー）の追加
		member, err := h.memberFac.Create(domain.CreateMemberParams{
			WorkspaceID: workspace.ID(),
			UserID:      userID,
			Role:        domain.MemberRoleOwner,
		})
		if err != nil {
			return err
		}
		if err := h.memberRepo.Save(ctx, member); err != nil {
			return err
		}

		// 3. 未分類プロジェクトの作成
		project, err := h.projectFac.Create(domain.CreateProjectParams{
			WorkspaceID: workspace.ID(),
			Name:        "未分類",
		})
		if err != nil {
			return err
		}
		if err := h.projectRepo.Save(ctx, project); err != nil {
			return err
		}

		return nil
	})
}
