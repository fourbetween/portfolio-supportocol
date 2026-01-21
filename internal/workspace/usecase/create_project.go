package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type CreateProjectUsecase struct {
	memberRepo  domain.MemberRepository
	projectRepo domain.ProjectRepository
	projectFac  *domain.ProjectFactory
	tx          dbtx.Manager
}

func NewCreateProjectUsecase(
	memberRepo domain.MemberRepository,
	projectRepo domain.ProjectRepository,
	projectFac *domain.ProjectFactory,
	tx dbtx.Manager,
) *CreateProjectUsecase {
	return &CreateProjectUsecase{
		memberRepo:  memberRepo,
		projectRepo: projectRepo,
		projectFac:  projectFac,
		tx:          tx,
	}
}

type CreateProjectInput struct {
	WorkspaceID string
	UserID      string
	Name        string
}

func (u *CreateProjectUsecase) Execute(ctx context.Context, input CreateProjectInput) (*domain.Project, error) {
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

		// プロジェクトの作成
		project, err = u.projectFac.Create(domain.CreateProjectParams{
			WorkspaceID: input.WorkspaceID,
			Name:        input.Name,
		})
		if err != nil {
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
