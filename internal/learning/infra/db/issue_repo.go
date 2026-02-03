package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/go-jet/jet/v2/mysql"
	"github.com/go-jet/jet/v2/qrm"
)

type IssueRepository struct {
	db  *sql.DB
	fac *domain.IssueFactory
}

func NewIssueRepository(db *sql.DB, fac *domain.IssueFactory) *IssueRepository {
	return &IssueRepository{db: db, fac: fac}
}

func (r *IssueRepository) Load(ctx context.Context, id string) (*domain.Issue, error) {
	stmt := mysql.
		SELECT(table.Issues.AllColumns).
		FROM(table.Issues).
		WHERE(table.Issues.ID.EQ(mysql.String(id)))

	var dest model.Issues
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load issue: %w", err)
	}

	return r.toDomain(dest)
}

func (r *IssueRepository) Save(ctx context.Context, i *domain.Issue) error {
	m := r.toModel(i)
	stmt := table.Issues.
		INSERT(table.Issues.AllColumns).
		MODEL(m).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Issues.Type.SET(table.Issues.NEW.Type),
			table.Issues.Description.SET(table.Issues.NEW.Description),
			table.Issues.Status.SET(table.Issues.NEW.Status),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save issue: %w", err)
	}

	return nil
}

func (r *IssueRepository) List(ctx context.Context) ([]*domain.Issue, error) {
	stmt := mysql.
		SELECT(table.Issues.AllColumns).
		FROM(table.Issues)

	var dest []model.Issues
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to list issues: %w", err)
	}

	res := make([]*domain.Issue, len(dest))
	for i, m := range dest {
		d, err := r.toDomain(m)
		if err != nil {
			return nil, err
		}
		res[i] = d
	}
	return res, nil
}

func (r *IssueRepository) Delete(ctx context.Context, i *domain.Issue) error {
	stmt := table.Issues.
		DELETE().
		WHERE(table.Issues.ID.EQ(mysql.String(i.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete issue: %w", err)
	}

	return nil
}

func (r *IssueRepository) toDomain(m model.Issues) (*domain.Issue, error) {
	status := domain.IssueStatus("")
	if m.Status != nil {
		status = domain.IssueStatus(*m.Status)
	}

	desc := ""
	if m.Description != nil {
		desc = *m.Description
	}

	return r.fac.Reconstruct(domain.ReconstructIssueParams{
		ID: m.ID,
		CreateIssueParams: domain.CreateIssueParams{
			IssueType:   m.Type,
			Description: desc,
			Status:      status,
		},
	})
}

func (r *IssueRepository) toModel(i *domain.Issue) model.Issues {
	desc := i.Description()
	status := string(i.Status())
	return model.Issues{
		ID:          i.ID(),
		Type:        i.IssueType(),
		Description: &desc,
		Status:      &status,
	}
}
