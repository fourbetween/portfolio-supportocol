package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/go-jet/jet/v2/mysql"
)

// DiscussionFavoritesService updates the favorites_count on the discussions table.
type DiscussionFavoritesService struct {
	db *sql.DB
}

func NewDiscussionFavoritesService(db *sql.DB) *DiscussionFavoritesService {
	return &DiscussionFavoritesService{db: db}
}

func (s *DiscussionFavoritesService) IncrementFavoritesCount(ctx context.Context, discussionID string) error {
	stmt := table.Discussions.
		UPDATE(table.Discussions.FavoritesCount).
		SET(table.Discussions.FavoritesCount.ADD(mysql.Int(1))).
		WHERE(table.Discussions.ID.EQ(mysql.String(discussionID)))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, s.db)); err != nil {
		return fmt.Errorf("failed to increment favorites count: %w", err)
	}

	return nil
}

func (s *DiscussionFavoritesService) DecrementFavoritesCount(ctx context.Context, discussionID string) error {
	stmt := table.Discussions.
		UPDATE(table.Discussions.FavoritesCount).
		SET(table.Discussions.FavoritesCount.SUB(mysql.Int(1))).
		WHERE(
			table.Discussions.ID.EQ(mysql.String(discussionID)).
				AND(table.Discussions.FavoritesCount.GT(mysql.Int(0))),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, s.db)); err != nil {
		return fmt.Errorf("failed to decrement favorites count: %w", err)
	}

	return nil
}
