package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/table"
	"github.com/go-jet/jet/v2/mysql"
)

type FavoriteDiscussionRepository struct {
	db *sql.DB
}

func NewFavoriteDiscussionRepository(db *sql.DB) *FavoriteDiscussionRepository {
	return &FavoriteDiscussionRepository{db: db}
}

func (r *FavoriteDiscussionRepository) Save(ctx context.Context, fav domain.FavoriteDiscussion) error {
	record := model.FavoriteDiscussions{
		MemberID:     fav.MemberID,
		DiscussionID: fav.DiscussionID,
		CreatedAt:    fav.CreatedAt,
	}

	stmt := table.FavoriteDiscussions.
		INSERT(table.FavoriteDiscussions.AllColumns).
		MODEL(record).
		ON_DUPLICATE_KEY_UPDATE(
			table.FavoriteDiscussions.CreatedAt.SET(table.FavoriteDiscussions.CreatedAt),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to save favorite discussion: %w", err)
	}

	return nil
}

func (r *FavoriteDiscussionRepository) Delete(ctx context.Context, memberID, discussionID string) error {
	stmt := table.FavoriteDiscussions.
		DELETE().
		WHERE(
			table.FavoriteDiscussions.MemberID.EQ(mysql.String(memberID)).
				AND(table.FavoriteDiscussions.DiscussionID.EQ(mysql.String(discussionID))),
		)

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete favorite discussion: %w", err)
	}

	return nil
}

func (r *FavoriteDiscussionRepository) CountByMemberID(ctx context.Context, memberID string) (int, error) {
	stmt := mysql.SELECT(
		mysql.COUNT(table.FavoriteDiscussions.MemberID).AS("count"),
	).FROM(
		table.FavoriteDiscussions,
	).WHERE(
		table.FavoriteDiscussions.MemberID.EQ(mysql.String(memberID)),
	)

	var dest struct {
		Count int64 `alias:"count"`
	}

	if err := stmt.QueryContext(ctx, dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		return 0, fmt.Errorf("failed to count favorite discussions: %w", err)
	}

	return int(dest.Count), nil
}
