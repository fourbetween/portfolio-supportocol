package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type DeleteProjectUsecase struct {
	memberRepo  domain.MemberRepository
	projectRepo domain.ProjectRepository
	tx          dbtx.Manager
}

func NewDeleteProjectUsecase(
	memberRepo domain.MemberRepository,
	projectRepo domain.ProjectRepository,
	tx dbtx.Manager,
) *DeleteProjectUsecase {
	return &DeleteProjectUsecase{
		memberRepo:  memberRepo,
		projectRepo: projectRepo,
		tx:          tx,
	}
}

type DeleteProjectInput struct {
	WorkspaceID string
	ProjectID   string
	UserID      string
}

func (u *DeleteProjectUsecase) Execute(ctx context.Context, input DeleteProjectInput) error {
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// メンバーシップと権限の確認
		member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
		if err != nil {
			return err
		}
		if !member.CanManageProjects() {
			return fmt.Errorf("user cannot manage projects: %w", apperr.ErrPermissionDenied)
		}

		// プロジェクトの取得
		project, err := u.projectRepo.Load(ctx, domain.LoadProjectParams{
			ID:          input.ProjectID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		// デフォルトプロジェクトの削除禁止
		if project.IsDefault() {
			return fmt.Errorf("default project cannot be deleted: %w", apperr.ErrPermissionDenied)
		}

		// プロジェクトの削除
		if err := u.projectRepo.Delete(ctx, project); err != nil {
			return err
		}

		return nil
	})
}
