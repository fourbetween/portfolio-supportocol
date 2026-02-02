package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db/schema/app-supportocol/table"
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
