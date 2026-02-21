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

type WorkspaceRepository struct {
	db  *sql.DB
	fac *domain.WorkspaceFactory
}

func NewWorkspaceRepository(db *sql.DB, fac *domain.WorkspaceFactory) *WorkspaceRepository {
	return &WorkspaceRepository{db: db, fac: fac}
}

type workspaceWithSubscriptionModel struct {
	model.Workspaces
	model.Subscriptions
	model.Plans
}

func (r *WorkspaceRepository) workspaceFromTable() mysql.ReadableTable {
	return table.Workspaces.
		INNER_JOIN(table.Subscriptions, table.Workspaces.ID.EQ(table.Subscriptions.WorkspaceID)).
		INNER_JOIN(table.Plans, table.Subscriptions.PlanID.EQ(table.Plans.ID))
}

func (r *WorkspaceRepository) workspaceColumns() mysql.ProjectionList {
	return mysql.ProjectionList{
		table.Workspaces.AllColumns,
		table.Subscriptions.AllColumns,
		table.Plans.AllColumns,
	}
}

func (r *WorkspaceRepository) Load(ctx context.Context, id string) (*domain.Workspace, error) {
	stmt := mysql.
		SELECT(r.workspaceColumns()).
		FROM(r.workspaceFromTable()).
		WHERE(table.Workspaces.ID.EQ(mysql.String(id))).
		LIMIT(1)

	var dest workspaceWithSubscriptionModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load workspace: %w", err)
	}

	return r.toDomain(dest)
}

func (r *WorkspaceRepository) LoadBySlug(ctx context.Context, slug string) (*domain.Workspace, error) {
	stmt := mysql.
		SELECT(r.workspaceColumns()).
		FROM(r.workspaceFromTable()).
		WHERE(table.Workspaces.Slug.EQ(mysql.String(slug))).
		LIMIT(1)

	var dest workspaceWithSubscriptionModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load workspace by slug: %w", err)
	}

	return r.toDomain(dest)
}

func (r *WorkspaceRepository) Search(ctx context.Context, params domain.SearchWorkspacesParams) ([]*domain.Workspace, error) {
	stmt := mysql.
		SELECT(r.workspaceColumns()).
		FROM(
			table.Workspaces.
				INNER_JOIN(table.Subscriptions, table.Workspaces.ID.EQ(table.Subscriptions.WorkspaceID)).
				INNER_JOIN(table.Plans, table.Subscriptions.PlanID.EQ(table.Plans.ID)).
				INNER_JOIN(table.Members, table.Workspaces.ID.EQ(table.Members.WorkspaceID)),
		).
		WHERE(table.Members.UserID.EQ(mysql.String(params.UserID))).
		ORDER_BY(table.Workspaces.CreatedAt.ASC())

	var dest []workspaceWithSubscriptionModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to search workspaces: %w", err)
	}

	workspaces := make([]*domain.Workspace, len(dest))
	for i, row := range dest {
		w, err := r.toDomain(row)
		if err != nil {
			return nil, err
		}
		workspaces[i] = w
	}

	return workspaces, nil
}

func (r *WorkspaceRepository) Save(ctx context.Context, w *domain.Workspace) error {
	// 1. ワークスペースの保存
	workspaceRecord := model.Workspaces{
		ID:        w.ID(),
		Slug:      w.Slug(),
		Name:      w.Name(),
		Type:      w.Type().String(),
		CreatedAt: w.CreatedAt(),
	}

	workspaceStmt := table.Workspaces.
		INSERT(table.Workspaces.AllColumns.Except(
			table.Workspaces.UpdatedAt,
		)).
		MODEL(workspaceRecord).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Workspaces.Name.SET(table.Workspaces.NEW.Name),
		)

	if _, err := workspaceStmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save workspace: %w", err)
	}

	// 2. サブスクリプションの保存
	sub := w.Subscription()
	subscriptionRecord := model.Subscriptions{
		WorkspaceID:          w.ID(),
		PlanID:               sub.Plan.ID,
		Status:               sub.Status.String(),
		CurrentPeriodStart:   sub.CurrentPeriodStart,
		CurrentPeriodEnd:     sub.CurrentPeriodEnd,
		StripeSubscriptionID: sub.StripeSubscriptionID,
	}

	subscriptionStmt := table.Subscriptions.
		INSERT(table.Subscriptions.AllColumns.Except(
			table.Subscriptions.CreatedAt,
			table.Subscriptions.UpdatedAt,
		)).
		MODEL(subscriptionRecord).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Subscriptions.PlanID.SET(table.Subscriptions.NEW.PlanID),
			table.Subscriptions.Status.SET(table.Subscriptions.NEW.Status),
			table.Subscriptions.CurrentPeriodStart.SET(table.Subscriptions.NEW.CurrentPeriodStart),
			table.Subscriptions.CurrentPeriodEnd.SET(table.Subscriptions.NEW.CurrentPeriodEnd),
			table.Subscriptions.StripeSubscriptionID.SET(table.Subscriptions.NEW.StripeSubscriptionID),
		)

	if _, err := subscriptionStmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save subscription: %w", err)
	}

	return nil
}

func (r *WorkspaceRepository) Delete(ctx context.Context, w *domain.Workspace) error {
	stmt := table.Workspaces.
		DELETE().
		WHERE(table.Workspaces.ID.EQ(mysql.String(w.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete workspace: %w", err)
	}

	return nil
}

func (r *WorkspaceRepository) toDomain(row workspaceWithSubscriptionModel) (*domain.Workspace, error) {
	return r.fac.Reconstruct(domain.ReconstructWorkspaceParams{
		ID:   row.Workspaces.ID,
		Slug: row.Workspaces.Slug,
		Name: row.Workspaces.Name,
		Type: domain.WorkspaceType(row.Workspaces.Type),
		Subscription: domain.Subscription{
			Plan: domain.Plan{
				ID:             row.Plans.ID,
				Name:           row.Plans.Name,
				Description:    row.Plans.Description,
				MonthlyAILimit: int(row.Plans.MonthlyAiLimit),
			},
			Status:               domain.SubscriptionStatus(row.Subscriptions.Status),
			CurrentPeriodStart:   row.Subscriptions.CurrentPeriodStart,
			CurrentPeriodEnd:     row.Subscriptions.CurrentPeriodEnd,
			StripeSubscriptionID: row.Subscriptions.StripeSubscriptionID,
		},
		CreatedAt: row.Workspaces.CreatedAt,
	})
}
