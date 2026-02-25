package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type MoveDiscussionsUsecase struct {
	memberRepo     domain.MemberRepository
	projectRepo    domain.ProjectRepository
	discussionRepo domain.DiscussionRepository
	tx             dbtx.Manager
}

func NewMoveDiscussionsUsecase(
	memberRepo domain.MemberRepository,
	projectRepo domain.ProjectRepository,
	discussionRepo domain.DiscussionRepository,
	tx dbtx.Manager,
) *MoveDiscussionsUsecase {
	return &MoveDiscussionsUsecase{
		memberRepo:     memberRepo,
		projectRepo:    projectRepo,
		discussionRepo: discussionRepo,
		tx:             tx,
	}
}

type MoveDiscussionsInput struct {
	WorkspaceID   string
	ProjectID     string
	DiscussionIDs []string
	UserID        string
}

func (u *MoveDiscussionsUsecase) Execute(ctx context.Context, input MoveDiscussionsInput) error {
	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		// メンバーシップと権限の確認
		member, err := u.memberRepo.Load(ctx, input.WorkspaceID, input.UserID)
		if err != nil {
			return err
		}
		if !member.CanManageProjects() {
			return fmt.Errorf("user cannot manage projects: %w", apperr.ErrPermissionDenied)
		}

		// 移動先プロジェクトの存在確認
		_, err = u.projectRepo.Load(ctx, domain.LoadProjectParams{
			ID:          input.ProjectID,
			WorkspaceID: input.WorkspaceID,
		})
		if err != nil {
			return err
		}

		// 議論の移動
		params := domain.MoveDiscussionsParams{
			WorkspaceID:   input.WorkspaceID,
			DiscussionIDs: input.DiscussionIDs,
			ToProjectID:   input.ProjectID,
		}
		if err := params.Validate(); err != nil {
			return err
		}

		return u.discussionRepo.MoveToProject(ctx, params)
	})
}
