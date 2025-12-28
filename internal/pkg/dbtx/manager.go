package dbtx

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/go-jet/jet/v2/qrm"
)

type txKey struct{}

func GetExecutor(ctx context.Context, db *sql.DB) qrm.DB {
	if tx, ok := ctx.Value(txKey{}).(*sql.Tx); ok {
		return tx
	}
	return db
}

type Manager interface {
	RunInTx(ctx context.Context, fn func(ctx context.Context) error) error
}

type sqlManager struct {
	db *sql.DB
}

func NewManager(db *sql.DB) Manager {
	return &sqlManager{db: db}
}

func (m *sqlManager) RunInTx(ctx context.Context, fn func(ctx context.Context) error) error {
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	ctxWithTx := context.WithValue(ctx, txKey{}, tx)

	if err := fn(ctxWithTx); err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return fmt.Errorf("rollback failed: %w: %w", rbErr, err)
		}
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit failed: %w", err)
	}
	return nil
}
