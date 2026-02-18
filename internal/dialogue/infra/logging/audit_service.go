package logging

import (
	"context"
	"log/slog"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
)

type slogAuditService struct{}

func NewSlogAuditService() domain.AuditService {
	return &slogAuditService{}
}

func (s *slogAuditService) LogCommentCreated(ctx context.Context, comment *domain.Comment) {
	var createdBy string
	if comment.CreatedBy() == nil {
		createdBy = "anonymous"
	} else {
		createdBy = *comment.CreatedBy()
	}

	slog.InfoContext(ctx, "comment created",
		slog.String("category", "audit"),
		slog.String("discussion_id", comment.DiscussionID()),
		slog.String("comment_id", comment.ID()),
		slog.String("type", comment.Type()),
		slog.String("content", comment.Content()),
		slog.String("created_by", createdBy),
		slog.Time("created_at", comment.CreatedAt()),
	)
}

func (s *slogAuditService) LogCommentIssueAdded(ctx context.Context, comment *domain.Comment, issue domain.CommentIssue) {
	var createdBy string
	if issue.CreatedBy == nil {
		createdBy = "anonymous"
	} else {
		createdBy = *issue.CreatedBy
	}

	slog.InfoContext(ctx, "comment issue added ",
		slog.String("category", "audit"),
		slog.String("discussion_id", comment.DiscussionID()),
		slog.String("comment_id", comment.ID()),
		slog.String("issue_id", issue.ID),
		slog.String("title", issue.Title),
		slog.String("description", issue.Description),
		slog.String("created_by", createdBy),
	)
}
