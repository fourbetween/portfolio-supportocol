package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
	"github.com/go-jet/jet/v2/mysql"
)

type aiUsageService struct {
	db            *sql.DB
	workspaceRepo domain.WorkspaceRepository
	idSrv         id.Service
}

func NewAIUsageService(
	db *sql.DB,
	workspaceRepo domain.WorkspaceRepository,
	idSrv id.Service,
) usecase.AIUsageService {
	return &aiUsageService{
		db:            db,
		workspaceRepo: workspaceRepo,
		idSrv:         idSrv,
	}
}

func (s *aiUsageService) CheckAIUsageLimit(ctx context.Context, workspaceID string) error {
	ws, err := s.workspaceRepo.Load(ctx, workspaceID)
	if err != nil {
		return fmt.Errorf("failed to load workspace: %w", err)
	}

	sub := ws.Subscription()
	count, err := s.countUsage(ctx, workspaceID, sub.CurrentPeriodStart, sub.CurrentPeriodEnd)
	if err != nil {
		return fmt.Errorf("failed to count AI usage: %w", err)
	}

	return ws.CanUseAI(count)
}

func (s *aiUsageService) RecordAIUsage(ctx context.Context, params usecase.RecordAIUsageParams) error {
	now := time.Now()
	record := model.AiUsageLogs{
		ID:           s.idSrv.Generate(),
		WorkspaceID:  params.WorkspaceID,
		DiscussionID: &params.DiscussionID,
		Tokens:       0,
		CreatedAt:    now,
	}

	stmt := table.AiUsageLogs.
		INSERT(table.AiUsageLogs.AllColumns).
		MODEL(record)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, s.db)); err != nil {
		return fmt.Errorf("failed to record AI usage: %w", err)
	}

	return nil
}

func (s *aiUsageService) countUsage(ctx context.Context, workspaceID string, from, to time.Time) (int, error) {
	stmt := mysql.SELECT(
		mysql.COUNT(table.AiUsageLogs.ID).AS("count"),
	).FROM(
		table.AiUsageLogs,
	).WHERE(
		table.AiUsageLogs.WorkspaceID.EQ(mysql.String(workspaceID)).
			AND(table.AiUsageLogs.CreatedAt.GT_EQ(mysql.TimestampT(from))).
			AND(table.AiUsageLogs.CreatedAt.LT(mysql.TimestampT(to))),
	)

	var dest struct {
		Count int64 `alias:"count"`
	}

	if err := stmt.QueryContext(ctx, dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return 0, fmt.Errorf("failed to count AI usage logs: %w", err)
	}

	return int(dest.Count), nil
}
