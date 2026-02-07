package db

import (
	"context"
	"database/sql"
	"time"

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

func (s *DiscussionQueryService) ListPublicDiscussions(ctx context.Context) ([]usecase.DiscussionSummary, error) {
	return s.listDiscussionsByStatus(ctx, "public", nil)
}

func (s *DiscussionQueryService) ListInternalDiscussions(ctx context.Context, workspaceID string) ([]usecase.DiscussionSummary, error) {
	return s.listDiscussionsByStatus(ctx, "internal", &workspaceID)
}

type discussionSummaryRow struct {
	ID                    string     `alias:"discussions.id"`
	WorkspaceID           string     `alias:"discussions.workspace_id"`
	Theme                 string     `alias:"discussions.theme"`
	Status                string     `alias:"discussions.status"`
	ArchivedAt            *time.Time `alias:"discussions.archived_at"`
	LastCommentedAt       time.Time  `alias:"discussions.last_commented_at"`
	ProposedCommentsCount int64      `alias:"proposed_comments_count"`
	IssuesCount           int64      `alias:"issues_count"`
}

func (s *DiscussionQueryService) listDiscussionsByStatus(ctx context.Context, status string, workspaceID *string) ([]usecase.DiscussionSummary, error) {
	cond := table.Discussions.Status.EQ(mysql.String(status))
	if workspaceID != nil {
		cond = cond.AND(table.Discussions.WorkspaceID.EQ(mysql.String(*workspaceID)))
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
			table.Discussions.WorkspaceID,
			table.Discussions.Theme,
			table.Discussions.Status,
			table.Discussions.ArchivedAt,
			table.Discussions.LastCommentedAt,
			proposedCommentsCount,
			issuesCount,
		).
		FROM(table.Discussions).
		WHERE(cond).
		ORDER_BY(table.Discussions.LastCommentedAt.DESC())

	var dest []discussionSummaryRow
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, err
	}

	res := make([]usecase.DiscussionSummary, len(dest))
	for i, d := range dest {
		res[i] = usecase.DiscussionSummary{
			ID:                    d.ID,
			WorkspaceID:           d.WorkspaceID,
			Theme:                 d.Theme,
			Status:                d.Status,
			ArchivedAt:            d.ArchivedAt,
			LastCommentedAt:       d.LastCommentedAt,
			ProposedCommentsCount: int(d.ProposedCommentsCount),
			IssuesCount:           int(d.IssuesCount),
		}
	}

	return res, nil
}
