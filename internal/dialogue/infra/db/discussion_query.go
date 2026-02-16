package db

import (
	"context"
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/dialogue/usecase"
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

func (s *DiscussionQueryService) ListPublicDiscussions(ctx context.Context, sort domain.DiscussionSort) ([]usecase.DiscussionSummary, error) {
	return s.listDiscussionsByStatus(ctx, "public", nil, sort)
}

func (s *DiscussionQueryService) ListInternalDiscussions(ctx context.Context, workspaceID string, sort domain.DiscussionSort) ([]usecase.DiscussionSummary, error) {
	return s.listDiscussionsByStatus(ctx, "internal", &workspaceID, sort)
}

func (s *DiscussionQueryService) orderBySort(sort domain.DiscussionSort) mysql.OrderByClause {
	switch sort {
	case domain.DiscussionSortLastCommentedAt:
		return table.Discussions.LastCommentedAt.DESC()
	default:
		return table.Discussions.FavoritesCount.DESC()
	}
}

func (s *DiscussionQueryService) listDiscussionsByStatus(ctx context.Context, status string, workspaceID *string, sort domain.DiscussionSort) ([]usecase.DiscussionSummary, error) {
	cond := table.Discussions.Status.EQ(mysql.String(status))
	if workspaceID != nil {
		cond = cond.AND(table.Discussions.WorkspaceID.EQ(mysql.String(*workspaceID)))
	}

	stmt := mysql.
		SELECT(
			table.Discussions.ID,
			table.Discussions.WorkspaceID,
			table.Discussions.Theme,
			table.Discussions.Status,
			table.Discussions.ArchivedAt,
			table.Discussions.LastCommentedAt,
			table.Discussions.CommentsCount,
			table.Discussions.FavoritesCount,
		).
		FROM(table.Discussions).
		WHERE(cond).
		ORDER_BY(s.orderBySort(sort), table.Discussions.LastCommentedAt.DESC()).
		LIMIT(100)

	var dest []model.Discussions
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, err
	}

	res := make([]usecase.DiscussionSummary, len(dest))
	for i, d := range dest {
		res[i] = usecase.DiscussionSummary{
			ID:              d.ID,
			WorkspaceID:     d.WorkspaceID,
			Theme:           d.Theme,
			Status:          d.Status,
			ArchivedAt:      d.ArchivedAt,
			LastCommentedAt: d.LastCommentedAt,
			CommentsCount:   int(d.CommentsCount),
			FavoritesCount:  int(d.FavoritesCount),
		}
	}

	return res, nil
}
