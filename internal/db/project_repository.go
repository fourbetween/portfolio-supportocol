package db

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/model"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/table"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
)

type (
	ProjectRepository struct {
		db  qrm.DB
		fac *project.Factory
	}
)

func NewProjectRepository(
	db qrm.DB,
) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) SetFactory(fac *project.Factory) {
	r.fac = fac
}

func (r *ProjectRepository) Save(p *project.Project) error {
	projectRecord := model.Projects{
		ID:        p.ID(),
		Name:      p.Name(),
		CreatedBy: p.CreatedBy(),
		CreatedAt: p.CreatedAt(),
	}

	projectStmt := table.Projects.
		INSERT(table.Projects.AllColumns).
		MODEL(projectRecord).
		ON_CONFLICT(table.Projects.ID).
		DO_UPDATE(
			postgres.SET(
				table.Projects.Name.SET(table.Projects.EXCLUDED.Name),
				table.Projects.CreatedBy.SET(table.Projects.EXCLUDED.CreatedBy),
				table.Projects.CreatedAt.SET(table.Projects.EXCLUDED.CreatedAt),
			),
		)

	if _, err := projectStmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save project: %w", err)
	}

	return nil
}

func (r *ProjectRepository) Delete(p *project.Project) error {
	stmt := table.Projects.
		DELETE().
		WHERE(table.Projects.ID.EQ(postgres.String(p.ID())))

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}

	return nil
}

func (r *ProjectRepository) Load(params project.LoadParams) (*project.Project, error) {
	cond := table.Projects.ID.EQ(postgres.String(params.ID))
	if params.CreatedBy != "" {
		cond = cond.AND(table.Projects.CreatedBy.EQ(postgres.String(params.CreatedBy)))
	}

	projects, err := r.searchByCondition(cond)
	if err != nil {
		return nil, err
	}
	if len(projects) == 0 {
		return nil, fmt.Errorf(
			"project id=%s, created_by=%s not found: %w",
			params.ID,
			params.CreatedBy,
			internal.ErrNotFound,
		)
	}
	return projects[0], nil
}

func (r *ProjectRepository) Search(params project.SearchParams) ([]*project.Project, error) {
	cond := postgres.Bool(true)
	if params.CreatedBy != "" {
		cond = cond.AND(table.Projects.CreatedBy.EQ(postgres.String(params.CreatedBy)))
	}
	return r.searchByCondition(cond)
}

func (r *ProjectRepository) searchByCondition(cond postgres.BoolExpression) ([]*project.Project, error) {
	stmt := postgres.
		SELECT(table.Projects.AllColumns).
		FROM(table.Projects).
		WHERE(cond)

	var dest []model.Projects
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to query projects: %w", err)
	}

	if len(dest) == 0 {
		return []*project.Project{}, nil
	}

	projects := make([]*project.Project, len(dest))
	for i, row := range dest {
		projects[i] = r.fac.BuildProject(project.BuildProjectParams{
			ID: row.ID,
			NewProjectParams: project.NewProjectParams{
				Name:      row.Name,
				CreatedBy: row.CreatedBy,
				CreatedAt: row.CreatedAt,
			},
		})
	}

	return projects, nil
}
