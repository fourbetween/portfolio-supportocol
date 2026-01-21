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

type ProjectRepository struct {
	db  *sql.DB
	fac *domain.ProjectFactory
}

func NewProjectRepository(db *sql.DB, fac *domain.ProjectFactory) *ProjectRepository {
	return &ProjectRepository{db: db, fac: fac}
}

func (r *ProjectRepository) Load(ctx context.Context, params domain.LoadProjectParams) (*domain.Project, error) {
	stmt := mysql.
		SELECT(table.Projects.AllColumns).
		FROM(table.Projects).
		WHERE(
			table.Projects.ID.EQ(mysql.String(params.ID)).
				AND(table.Projects.WorkspaceID.EQ(mysql.String(params.WorkspaceID))),
		).
		LIMIT(1)

	var dest model.Projects
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load project: %w", err)
	}

	return r.toDomain(dest)
}

func (r *ProjectRepository) Search(ctx context.Context, params domain.SearchProjectsParams) ([]*domain.Project, error) {
	stmt := mysql.
		SELECT(table.Projects.AllColumns).
		FROM(table.Projects).
		WHERE(table.Projects.WorkspaceID.EQ(mysql.String(params.WorkspaceID))).
		ORDER_BY(table.Projects.CreatedAt.ASC())

	var dest []model.Projects
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to search projects: %w", err)
	}

	projects := make([]*domain.Project, len(dest))
	for i, row := range dest {
		p, err := r.toDomain(row)
		if err != nil {
			return nil, err
		}
		projects[i] = p
	}

	return projects, nil
}

func (r *ProjectRepository) Save(ctx context.Context, p *domain.Project) error {
	record := model.Projects{
		ID:          p.ID(),
		WorkspaceID: p.WorkspaceID(),
		Name:        p.Name(),
		CreatedAt:   p.CreatedAt(),
	}

	stmt := table.Projects.
		INSERT(table.Projects.AllColumns.Except(
			table.Projects.UpdatedAt,
		)).
		MODEL(record).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Projects.Name.SET(table.Projects.NEW.Name),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save project: %w", err)
	}

	return nil
}

func (r *ProjectRepository) Delete(ctx context.Context, p *domain.Project) error {
	stmt := table.Projects.
		DELETE().
		WHERE(table.Projects.ID.EQ(mysql.String(p.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}

	return nil
}

func (r *ProjectRepository) toDomain(row model.Projects) (*domain.Project, error) {
	return r.fac.Reconstruct(domain.ReconstructProjectParams{
		ID: row.ID,
		CreateProjectParams: domain.CreateProjectParams{
			WorkspaceID: row.WorkspaceID,
			Name:        row.Name,
		},
		CreatedAt: row.CreatedAt,
	})
}
