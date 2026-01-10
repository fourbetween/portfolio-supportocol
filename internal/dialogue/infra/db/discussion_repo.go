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

type DiscussionRepository struct {
	db  *sql.DB
	fac *domain.DiscussionFactory
}

func NewDiscussionRepository(db *sql.DB) *DiscussionRepository {
	return &DiscussionRepository{db: db}
}

func (r *DiscussionRepository) SetFactory(fac *domain.DiscussionFactory) {
	r.fac = fac
}

func (r *DiscussionRepository) Load(ctx context.Context, params domain.LoadDiscussionParams) (*domain.Discussion, error) {
	cond := table.Discussions.ID.EQ(mysql.String(params.ID))

	stmt := mysql.
		SELECT(table.Discussions.AllColumns).
		FROM(table.Discussions).
		WHERE(cond).
		LIMIT(1)

	var dest model.Discussions
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load discussion: %w", err)
	}

	return r.toDomain(dest)
}

func (r *DiscussionRepository) Search(ctx context.Context) ([]*domain.Discussion, error) {
	stmt := mysql.
		SELECT(table.Discussions.AllColumns).
		FROM(table.Discussions).
		WHERE(table.Discussions.Status.EQ(mysql.String("public"))).
		ORDER_BY(table.Discussions.CreatedAt.DESC())

	var dest []model.Discussions
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to list discussions: %w", err)
	}

	discussions := make([]*domain.Discussion, len(dest))
	for i, row := range dest {
		d, err := r.toDomain(row)
		if err != nil {
			return nil, err
		}
		discussions[i] = d
	}

	return discussions, nil
}

func (r *DiscussionRepository) toDomain(row model.Discussions) (*domain.Discussion, error) {
	return r.fac.Reconstruct(domain.ReconstructDiscussionParams{
		ID:        row.ID,
		Theme:     row.Theme,
		CreatedBy: row.CreatedBy,
		CreatedAt: row.CreatedAt,
	})
}
