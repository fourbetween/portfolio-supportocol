package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type UpdateProjectUsecase struct {
	memberRepo  domain.MemberRepository
	projectRepo domain.ProjectRepository
	tx          dbtx.Manager
}

func NewUpdateProjectUsecase(
	memberRepo domain.MemberRepository,
	projectRepo domain.ProjectRepository,
	tx dbtx.Manager,
) *UpdateProjectUsecase {
	return &UpdateProjectUsecase{
		memberRepo:  memberRepo,
		projectRepo: projectRepo,
		tx:          tx,
	}
}

type UpdateProjectInput struct {
	WorkspaceID string
	ProjectID   string
	UserID      string
	Name        string
}

func (u *UpdateProjectUsecase) Execute(ctx context.Context, input UpdateProjectInput) (*domain.Project, error) {
	var project *domain.Project
	err := u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// メンバーシップと権限の確認
		member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
		if err != nil {
			return err
		}
		if !member.CanManageProjects() {
			return fmt.Errorf("user cannot manage projects: %w", apperr.ErrPermissionDenied)
		}

		// プロジェクトの取得
		project, err = u.projectRepo.Load(ctx, domain.LoadProjectParams{
			ID:          input.ProjectID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		// プロジェクトの更新
		if err := project.Update(domain.UpdateProjectParams{
			Name: input.Name,
		}); err != nil {
			return err
		}

		if err := u.projectRepo.Save(ctx, project); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return project, nil
}
