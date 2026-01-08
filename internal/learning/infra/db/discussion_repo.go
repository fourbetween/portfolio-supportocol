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
	cond := table.Discussions.ID.EQ(mysql.String(params.ID)).
		AND(table.Discussions.CreatedBy.EQ(mysql.String(params.CreatedBy)))

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

func (r *DiscussionRepository) Search(ctx context.Context, createdBy string) ([]*domain.Discussion, error) {
	stmt := mysql.
		SELECT(table.Discussions.AllColumns).
		FROM(table.Discussions).
		WHERE(table.Discussions.CreatedBy.EQ(mysql.String(createdBy))).
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

func (r *DiscussionRepository) Save(ctx context.Context, d *domain.Discussion) error {
	model := r.toModel(d)

	stmt := table.Discussions.
		INSERT(table.Discussions.AllColumns.Except(table.Discussions.UpdatedAt)).
		MODEL(model).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Discussions.Theme.SET(table.Discussions.NEW.Theme),
			table.Discussions.Status.SET(table.Discussions.NEW.Status),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save discussion: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) Delete(ctx context.Context, d *domain.Discussion) error {
	stmt := table.Discussions.
		DELETE().
		WHERE(table.Discussions.ID.EQ(mysql.String(d.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete discussion: %w", err)
	}
	return nil
}

func (r *DiscussionRepository) toDomain(row model.Discussions) (*domain.Discussion, error) {
	return r.fac.Reconstruct(domain.ReconstructDiscussionParams{
		ID: row.ID,
		CreateDiscussionParams: domain.CreateDiscussionParams{
			Theme:     row.Theme,
			Status:    domain.DiscussionStatus(row.Status),
			CreatedBy: row.CreatedBy,
		},
		CreatedAt: row.CreatedAt,
	})
}

func (r *DiscussionRepository) toModel(d *domain.Discussion) model.Discussions {
	return model.Discussions{
		ID:        d.ID(),
		Theme:     d.Theme(),
		Status:    string(d.Status()),
		CreatedBy: d.CreatedBy(),
		CreatedAt: d.CreatedAt(),
	}
}
