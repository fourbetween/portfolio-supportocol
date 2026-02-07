package db

import (
	"context"
	"database/sql"
	"time"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
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

type discussionSummaryRow struct {
	ID                    string     `alias:"discussions.id"`
	ProjectID             string     `alias:"discussions.project_id"`
	Theme                 string     `alias:"discussions.theme"`
	Status                string     `alias:"discussions.status"`
	ArchivedAt            *time.Time `alias:"discussions.archived_at"`
	LastCommentedAt       time.Time  `alias:"discussions.last_commented_at"`
	ProposedCommentsCount int64      `alias:"proposed_comments_count"`
	IssuesCount           int64      `alias:"issues_count"`
}

func (s *discussionQueryService) ListDiscussions(ctx context.Context, params usecase.ListDiscussionsParams) ([]usecase.DiscussionSummary, error) {
	condition := table.Discussions.WorkspaceID.EQ(mysql.String(params.WorkspaceID)).
		AND(table.Discussions.ProjectID.EQ(mysql.String(params.ProjectID)))
	if params.Archived {
		condition = condition.AND(table.Discussions.ArchivedAt.IS_NOT_NULL())
	} else {
		condition = condition.AND(table.Discussions.ArchivedAt.IS_NULL())
	}

	proposedCommentsCount := mysql.RawInt(
		"(SELECT COUNT(*) FROM comments c WHERE c.discussion_id = discussions.id AND c.status = 'proposed')",
	).AS("proposed_comments_count")

	issuesCount := mysql.RawInt(
		"(SELECT COUNT(*) FROM comment_issues ci INNER JOIN comments c ON ci.comment_id = c.id WHERE c.discussion_id = discussions.id)",
	).AS("issues_count")

	stmt := mysql.
		SELECT(
			table.Discussions.ID,
			table.Discussions.ProjectID,
			table.Discussions.Theme,
			table.Discussions.Status,
			table.Discussions.ArchivedAt,
			table.Discussions.LastCommentedAt,
			proposedCommentsCount,
			issuesCount,
		).
		FROM(table.Discussions).
		WHERE(condition).
		ORDER_BY(table.Discussions.LastCommentedAt.DESC())

	var dest []discussionSummaryRow
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, err
	}

	res := make([]usecase.DiscussionSummary, len(dest))
	for i, d := range dest {
		res[i] = usecase.DiscussionSummary{
			ID:                    d.ID,
			ProjectID:             d.ProjectID,
			Theme:                 d.Theme,
			Status:                domain.DiscussionStatus(d.Status),
			ArchivedAt:            d.ArchivedAt,
			LastCommentedAt:       d.LastCommentedAt,
			ProposedCommentsCount: int(d.ProposedCommentsCount),
			IssuesCount:           int(d.IssuesCount),
		}
	}

	return res, nil
}
