package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
)

type CreateDiscussionUsecase struct {
	repo        domain.DiscussionRepository
	fac         *domain.DiscussionFactory
	permSv      domain.PermissionService
	tx          dbtx.Manager
	auditSv     domain.AuditService
	commentRepo domain.CommentRepository
	generator   domain.CommentGenerator
	aiUsageSv   domain.AIUsageService
	clockSrv    clock.Service
}

func NewCreateDiscussionUsecase(
	repo domain.DiscussionRepository,
	fac *domain.DiscussionFactory,
	permSv domain.PermissionService,
	tx dbtx.Manager,
	auditSv domain.AuditService,
	commentRepo domain.CommentRepository,
	generator domain.CommentGenerator,
	aiUsageSv domain.AIUsageService,
	clockSrv clock.Service,
) *CreateDiscussionUsecase {
	return &CreateDiscussionUsecase{
		repo:        repo,
		fac:         fac,
		permSv:      permSv,
		tx:          tx,
		auditSv:     auditSv,
		commentRepo: commentRepo,
		generator:   generator,
		aiUsageSv:   aiUsageSv,
		clockSrv:    clockSrv,
	}
}

type CreateDiscussionInput struct {
	WorkspaceID string
	ProjectID   string
	Theme       string
	Premise     string
	UserID      string
	SourceType  string
	SourceBody  string
}

func (u *CreateDiscussionUsecase) Execute(ctx context.Context, input CreateDiscussionInput) (*domain.Discussion, error) {
	canAccess, err := u.permSv.CanAccessProject(ctx, input.UserID, input.WorkspaceID, input.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("failed to check workspace access: %w", err)
	}
	if !canAccess {
		return nil, apperr.ErrPermissionDenied
	}

	var discussion *domain.Discussion
	err = u.tx.RunInTx(ctx, func(ctx context.Context) error {
		count, err := u.repo.CountByProjectID(ctx, input.WorkspaceID, input.ProjectID)
		if err != nil {
			return err
		}

		discussion, err = u.fac.Create(domain.CreateDiscussionParams{
			WorkspaceID: input.WorkspaceID,
			ProjectID:   input.ProjectID,
			Theme:       input.Theme,
			Premise:     input.Premise,
			CreatedBy:   input.UserID,
		}, count)
		if err != nil {
			return err
		}

		if err := u.repo.Save(ctx, discussion); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	u.auditSv.LogDiscussionCreated(ctx, discussion)

	if input.SourceType != "" && input.SourceBody != "" {
		if err := u.generateAndSaveComments(ctx, discussion, input); err != nil {
			return nil, err
		}
	}

	return discussion, nil
}

func (u *CreateDiscussionUsecase) generateAndSaveComments(ctx context.Context, discussion *domain.Discussion, input CreateDiscussionInput) error {
	if err := u.aiUsageSv.CheckCommentGenerationLimit(ctx, input.WorkspaceID); err != nil {
		return err
	}

	result, err := u.generator.GenerateDiscussionComments(ctx, domain.GenerateDiscussionCommentsParams{
		DiscussionID: discussion.ID(),
		WorkspaceID:  input.WorkspaceID,
		SourceType:   input.SourceType,
		SourceBody:   input.SourceBody,
		UserID:       input.UserID,
	})
	if err != nil {
		return err
	}

	return u.tx.RunInTx(ctx, func(ctx context.Context) error {
		if err := u.commentRepo.BatchCreate(ctx, result.Comments); err != nil {
			return err
		}

		discussion.AddComments(len(result.Comments), u.clockSrv.Now())
		if err := u.repo.Save(ctx, discussion); err != nil {
			return err
		}

		return u.aiUsageSv.RecordCommentGeneration(ctx, input.WorkspaceID, discussion.ID(), result.Tokens)
	})
}
