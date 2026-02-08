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

type MemberRepository struct {
	db  *sql.DB
	fac *domain.MemberFactory
}

func NewMemberRepository(db *sql.DB, fac *domain.MemberFactory) *MemberRepository {
	return &MemberRepository{db: db, fac: fac}
}

func (r *MemberRepository) Load(ctx context.Context, workspaceID, userID string) (*domain.Member, error) {
	stmt := mysql.
		SELECT(table.Members.AllColumns).
		FROM(table.Members).
		WHERE(
			table.Members.WorkspaceID.EQ(mysql.String(workspaceID)).
				AND(table.Members.UserID.EQ(mysql.String(userID))),
		).
		LIMIT(1)

	var dest model.Members
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, apperr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to load member: %w", err)
	}

	return r.toDomain(dest)
}

func (r *MemberRepository) Search(ctx context.Context, params domain.SearchMembersParams) ([]*domain.Member, error) {
	stmt := mysql.
		SELECT(table.Members.AllColumns).
		FROM(table.Members).
		WHERE(table.Members.WorkspaceID.EQ(mysql.String(params.WorkspaceID))).
		ORDER_BY(table.Members.CreatedAt.ASC())

	var dest []model.Members
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to search members: %w", err)
	}

	members := make([]*domain.Member, len(dest))
	for i, row := range dest {
		m, err := r.toDomain(row)
		if err != nil {
			return nil, err
		}
		members[i] = m
	}

	return members, nil
}

func (r *MemberRepository) Save(ctx context.Context, m *domain.Member) error {
	record := model.Members{
		WorkspaceID: m.WorkspaceID(),
		UserID:      m.UserID(),
		Role:        m.Role().String(),
		CreatedAt:   m.CreatedAt(),
	}

	stmt := table.Members.
		INSERT(table.Members.AllColumns.Except(
			table.Members.UpdatedAt,
		)).
		MODEL(record).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Members.Role.SET(table.Members.NEW.Role),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save member: %w", err)
	}

	return nil
}

func (r *MemberRepository) Delete(ctx context.Context, m *domain.Member) error {
	stmt := table.Members.
		DELETE().
		WHERE(
			table.Members.WorkspaceID.EQ(mysql.String(m.WorkspaceID())).
				AND(table.Members.UserID.EQ(mysql.String(m.UserID()))),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete member: %w", err)
	}

	return nil
}

func (r *MemberRepository) toDomain(row model.Members) (*domain.Member, error) {
	return r.fac.Reconstruct(domain.ReconstructMemberParams{
		WorkspaceID: row.WorkspaceID,
		UserID:      row.UserID,
		Role:        domain.MemberRole(row.Role),
		CreatedAt:   row.CreatedAt,
	})
}
