package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/table"
	"github.com/go-jet/jet/v2/mysql"
	"github.com/go-jet/jet/v2/qrm"
)

type PlanRepository struct {
	db *sql.DB
}

func NewPlanRepository(db *sql.DB) *PlanRepository {
	return &PlanRepository{db: db}
}

func (r *PlanRepository) Load(ctx context.Context, id string) (domain.Plan, error) {
	stmt := mysql.
		SELECT(table.Plans.AllColumns).
		FROM(table.Plans).
		WHERE(table.Plans.ID.EQ(mysql.String(id))).
		LIMIT(1)

	var dest model.Plans
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return domain.Plan{}, apperr.ErrNotFound
		}
		return domain.Plan{}, fmt.Errorf("failed to load plan: %w", err)
	}

	return r.toDomain(dest), nil
}

func (r *PlanRepository) LoadDefault(ctx context.Context) (domain.Plan, error) {
	stmt := mysql.
		SELECT(table.Plans.AllColumns).
		FROM(table.Plans).
		ORDER_BY(table.Plans.MonthlyAiLimit.ASC()).
		LIMIT(1)

	var dest model.Plans
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return domain.Plan{}, apperr.ErrNotFound
		}
		return domain.Plan{}, fmt.Errorf("failed to load default plan: %w", err)
	}

	return r.toDomain(dest), nil
}

func (r *PlanRepository) Save(ctx context.Context, plan domain.Plan) error {
	record := model.Plans{
		ID:             plan.ID,
		Name:           plan.Name,
		Description:    plan.Description,
		MonthlyAiLimit: int32(plan.MonthlyAILimit),
	}

	stmt := table.Plans.
		INSERT(table.Plans.AllColumns.Except(
			table.Plans.CreatedAt,
			table.Plans.UpdatedAt,
		)).
		MODEL(record).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Plans.Name.SET(table.Plans.NEW.Name),
			table.Plans.Description.SET(table.Plans.NEW.Description),
			table.Plans.MonthlyAiLimit.SET(table.Plans.NEW.MonthlyAiLimit),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save plan: %w", err)
	}

	return nil
}

func (r *PlanRepository) toDomain(row model.Plans) domain.Plan {
	return domain.Plan{
		ID:             row.ID,
		Name:           row.Name,
		Description:    row.Description,
		MonthlyAILimit: int(row.MonthlyAiLimit),
	}
}
