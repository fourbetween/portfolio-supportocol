package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type GenerateDiscussionUsecase struct {
	discussionRepo domain.DiscussionRepository
	commentRepo    domain.CommentRepository
	discussionFac  *domain.DiscussionFactory
	generator      domain.CommentGenerator
	permSv         domain.PermissionService
	aiUsageSv      domain.AIUsageService
	clock          clock.Service
	tx             dbtx.Manager
	auditSv        domain.AuditService
}

func NewGenerateDiscussionUsecase(
	discussionRepo domain.DiscussionRepository,
	commentRepo domain.CommentRepository,
	discussionFac *domain.DiscussionFactory,
	generator domain.CommentGenerator,
	permSv domain.PermissionService,
	aiUsageSv domain.AIUsageService,
	clock clock.Service,
	tx dbtx.Manager,
	auditSv domain.AuditService,
) *GenerateDiscussionUsecase {
	return &GenerateDiscussionUsecase{
		discussionRepo: discussionRepo,
		commentRepo:    commentRepo,
		discussionFac:  discussionFac,
		generator:      generator,
		permSv:         permSv,
		aiUsageSv:      aiUsageSv,
		clock:          clock,
		tx:             tx,
		auditSv:        auditSv,
	}
}

type GenerateDiscussionInput struct {
	WorkspaceID string
	ProjectID   string
	Title       string
	Text        string
	URLs        []string
	UserID      string
}

type GenerateDiscussionOutput struct {
	Discussion *domain.Discussion
	Comments   []*domain.Comment
}

func (u *GenerateDiscussionUsecase) Execute(ctx context.Context, input GenerateDiscussionInput) (GenerateDiscussionOutput, error) {
	access, err := u.permSv.CheckWorkspaceAccess(ctx, input.UserID, input.WorkspaceID)
	if err != nil {
		return GenerateDiscussionOutput{}, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !access.CanAccess {
		return GenerateDiscussionOutput{}, apperr.ErrPermissionDenied
	}

	canAccessProject, err := u.permSv.CanAccessProject(ctx, input.UserID, input.WorkspaceID, input.ProjectID)
	if err != nil {
		return GenerateDiscussionOutput{}, fmt.Errorf("failed to check project access: %w", err)
	}
	if !canAccessProject {
		return GenerateDiscussionOutput{}, apperr.ErrPermissionDenied
	}

	if err := u.aiUsageSv.CheckCommentGenerationLimit(ctx, input.WorkspaceID); err != nil {
		return GenerateDiscussionOutput{}, err
	}

	result, err := u.generator.GenerateDiscussion(ctx, domain.GenerateDiscussionParams{
		WorkspaceID: input.WorkspaceID,
		ProjectID:   input.ProjectID,
		Title:       input.Title,
		Text:        input.Text,
		URLs:        input.URLs,
		UserID:      input.UserID,
	})
	if err != nil {
		return GenerateDiscussionOutput{}, err
	}

	var discussion *domain.Discussion
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		count, err := u.discussionRepo.CountByProjectID(ctx, input.WorkspaceID, input.ProjectID)
		if err != nil {
			return err
		}

		discussion, err = u.discussionFac.Create(domain.CreateDiscussionParams{
			WorkspaceID: input.WorkspaceID,
			ProjectID:   input.ProjectID,
			Theme:       result.Theme,
			Premise:     result.Premise,
			Conclusion:  result.Conclusion,
			Language:    result.Language,
			CreatedBy:   input.UserID,
		}, count)
		if err != nil {
			return err
		}

		for _, c := range result.Comments {
			c.SetDiscussionID(discussion.ID())
		}

		if err := u.discussionRepo.Save(ctx, discussion); err != nil {
			return err
		}

		if err := u.commentRepo.BatchCreate(ctx, result.Comments); err != nil {
			return err
		}

		discussion.AddComments(len(result.Comments), u.clock.Now())
		if err := u.discussionRepo.Save(ctx, discussion); err != nil {
			return err
		}

		return u.aiUsageSv.RecordCommentGeneration(ctx, input.WorkspaceID, discussion.ID(), result.Tokens)
	})
	if err != nil {
		return GenerateDiscussionOutput{}, err
	}

	u.auditSv.LogDiscussionCreated(ctx, discussion)

	return GenerateDiscussionOutput{
		Discussion: discussion,
		Comments:   result.Comments,
	}, nil
}
