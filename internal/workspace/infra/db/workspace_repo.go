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

func (r *WorkspaceRepository) Load(ctx context.Context, id string) (*domain.Workspace, error) {
	stmt := mysql.
		SELECT(table.Workspaces.AllColumns).
		FROM(table.Workspaces).
		WHERE(table.Workspaces.ID.EQ(mysql.String(id))).
		LIMIT(1)

	var dest model.Workspaces
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
		SELECT(table.Workspaces.AllColumns).
		FROM(table.Workspaces).
		WHERE(table.Workspaces.Slug.EQ(mysql.String(slug))).
		LIMIT(1)

	var dest model.Workspaces
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
		SELECT(table.Workspaces.AllColumns).
		FROM(
			table.Workspaces.
				INNER_JOIN(table.Members, table.Workspaces.ID.EQ(table.Members.WorkspaceID)),
		).
		WHERE(table.Members.UserID.EQ(mysql.String(params.UserID))).
		ORDER_BY(table.Workspaces.CreatedAt.ASC())

	var dest []model.Workspaces
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
	record := model.Workspaces{
		ID:        w.ID(),
		Slug:      w.Slug(),
		Name:      w.Name(),
		Type:      w.Type().String(),
		CreatedAt: w.CreatedAt(),
	}

	stmt := table.Workspaces.
		INSERT(table.Workspaces.AllColumns.Except(
			table.Workspaces.UpdatedAt,
		)).
		MODEL(record).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Workspaces.Name.SET(table.Workspaces.NEW.Name),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save workspace: %w", err)
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

func (r *WorkspaceRepository) toDomain(row model.Workspaces) (*domain.Workspace, error) {
	return r.fac.Reconstruct(domain.ReconstructWorkspaceParams{
		ID: row.ID,
		CreateWorkspaceParams: domain.CreateWorkspaceParams{
			Slug: row.Slug,
			Name: row.Name,
			Type: domain.WorkspaceType(row.Type),
		},
		CreatedAt: row.CreatedAt,
	})
}
