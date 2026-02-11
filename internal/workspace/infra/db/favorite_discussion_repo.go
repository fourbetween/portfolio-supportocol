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
			table.FavoriteDiscussions.MemberID.SET(table.FavoriteDiscussions.MemberID),
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
