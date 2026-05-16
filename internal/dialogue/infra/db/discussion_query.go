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

func (s *DiscussionQueryService) ListPublicDiscussions(
	ctx context.Context,
	language string,
	sort domain.DiscussionSort,
	paging usecase.Paging,
) (usecase.DiscussionListResult, error) {
	return s.listDiscussionsByStatus(ctx, "public", nil, language, sort, paging)
}

func (s *DiscussionQueryService) ListInternalDiscussions(
	ctx context.Context,
	workspaceID string,
	sort domain.DiscussionSort,
	paging usecase.Paging,
) (usecase.DiscussionListResult, error) {
	return s.listDiscussionsByStatus(ctx, "internal", &workspaceID, "", sort, paging)
}

func (s *DiscussionQueryService) orderBySort(sort domain.DiscussionSort) mysql.OrderByClause {
	switch sort {
	case domain.DiscussionSortLastCommentedAt:
		return table.Discussions.LastCommentedAt.DESC()
	default:
		return table.Discussions.FavoritesCount.DESC()
	}
}

func (s *DiscussionQueryService) listDiscussionsByStatus(
	ctx context.Context,
	status string,
	workspaceID *string,
	language string,
	sort domain.DiscussionSort,
	paging usecase.Paging,
) (usecase.DiscussionListResult, error) {
	cond := table.Discussions.Status.EQ(mysql.String(status))
	if workspaceID != nil {
		cond = cond.AND(table.Discussions.WorkspaceID.EQ(mysql.String(*workspaceID)))
	}
	if language != "" {
		cond = cond.AND(table.Discussions.Language.EQ(mysql.String(language)))
	}

	executor := dbtx.GetExecutor(ctx, s.db)

	countStmt := mysql.
		SELECT(mysql.COUNT(table.Discussions.ID).AS("total_count")).
		FROM(table.Discussions).
		WHERE(cond)

	var countDest struct {
		TotalCount int `alias:"total_count"`
	}
	if err := countStmt.Query(executor, &countDest); err != nil {
		return usecase.DiscussionListResult{}, err
	}

	stmt := mysql.
		SELECT(
			table.Discussions.ID,
			table.Discussions.WorkspaceID,
			table.Discussions.Theme,
			table.Discussions.Language,
			table.Discussions.Status,
			table.Discussions.ArchivedAt,
			table.Discussions.LastCommentedAt,
			table.Discussions.CommentsCount,
			table.Discussions.FavoritesCount,
		).
		FROM(table.Discussions).
		WHERE(cond).
		ORDER_BY(s.orderBySort(sort), table.Discussions.LastCommentedAt.DESC()).
		LIMIT(int64(paging.Limit())).
		OFFSET(int64(paging.Offset()))

	var dest []model.Discussions
	if err := stmt.Query(executor, &dest); err != nil {
		return usecase.DiscussionListResult{}, err
	}

	items := make([]usecase.DiscussionSummary, len(dest))
	for i, d := range dest {
		items[i] = usecase.DiscussionSummary{
			ID:              d.ID,
			WorkspaceID:     d.WorkspaceID,
			Theme:           d.Theme,
			Language:        d.Language,
			Status:          d.Status,
			ArchivedAt:      d.ArchivedAt,
			LastCommentedAt: d.LastCommentedAt,
			CommentsCount:   int(d.CommentsCount),
			FavoritesCount:  int(d.FavoritesCount),
		}
	}

	return usecase.DiscussionListResult{
		Items:      items,
		TotalCount: countDest.TotalCount,
	}, nil
}
