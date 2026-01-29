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

// discussionQueryService is implementation of usecase.DiscussionQueryService.
type discussionQueryService struct {
	db *sql.DB
}

func NewDiscussionQueryService(db *sql.DB) *discussionQueryService {
	return &discussionQueryService{db: db}
}

func (s *discussionQueryService) ListDiscussions(ctx context.Context, params usecase.ListDiscussionsParams) ([]usecase.DiscussionSummary, error) {
	condition := table.Discussions.WorkspaceID.EQ(mysql.String(params.WorkspaceID)).
		AND(table.Discussions.ProjectID.EQ(mysql.String(params.ProjectID)))
	if params.Archived {
		condition = condition.AND(table.Discussions.ArchivedAt.IS_NOT_NULL())
	} else {
		condition = condition.AND(table.Discussions.ArchivedAt.IS_NULL())
	}

	stmt := mysql.
		SELECT(
			table.Discussions.ID,
			table.Discussions.ProjectID,
			table.Discussions.Theme,
			table.Discussions.Status,
			table.Discussions.ArchivedAt,
			table.Discussions.LastCommentedAt,
		).
		FROM(table.Discussions).
		WHERE(condition).
		ORDER_BY(table.Discussions.LastCommentedAt.DESC())

	var dest []model.Discussions
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, err
	}

	res := make([]usecase.DiscussionSummary, len(dest))
	for i, d := range dest {
		res[i] = usecase.DiscussionSummary{
			ID:              d.ID,
			ProjectID:       d.ProjectID,
			Theme:           d.Theme,
			Status:          domain.DiscussionStatus(d.Status),
			ArchivedAt:      d.ArchivedAt,
			LastCommentedAt: d.LastCommentedAt,
		}
	}

	return res, nil
}
