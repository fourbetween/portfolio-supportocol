package db

import (
	"context"
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/go-jet/jet/v2/mysql"
)

// DiscussionQueryService is implementation of usecase.DiscussionQueryService.
type DiscussionQueryService struct {
	db *sql.DB
}

func NewDiscussionQueryService(db *sql.DB) *DiscussionQueryService {
	return &DiscussionQueryService{db: db}
}

func (s *DiscussionQueryService) ListDiscussions(ctx context.Context, createdBy string) ([]*usecase.DiscussionSummary, error) {
	stmt := mysql.
		SELECT(
			table.Discussions.ID,
			table.Discussions.Theme,
			table.Discussions.Status,
			table.Discussions.ArchivedAt,
			table.Discussions.LastCommentedAt,
		).
		FROM(table.Discussions).
		WHERE(table.Discussions.CreatedBy.EQ(mysql.String(createdBy))).
		ORDER_BY(table.Discussions.LastCommentedAt.DESC())

	var dest []model.Discussions
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, err
	}

	res := make([]*usecase.DiscussionSummary, len(dest))
	for i, d := range dest {
		res[i] = &usecase.DiscussionSummary{
			ID:              d.ID,
			Theme:           d.Theme,
			Status:          domain.DiscussionStatus(d.Status),
			ArchivedAt:      d.ArchivedAt,
			LastCommentedAt: d.LastCommentedAt,
		}
	}

	return res, nil
}
