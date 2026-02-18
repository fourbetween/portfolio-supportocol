package logging

import (
	"context"
	"log/slog"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
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

func (s *slogAuditService) LogCommentUpdated(ctx context.Context, comment *domain.Comment) {
	var createdBy string
	if comment.CreatedBy() == nil {
		createdBy = "anonymous"
	} else {
		createdBy = *comment.CreatedBy()
	}

	slog.InfoContext(ctx, "comment updated",
		slog.String("category", "audit"),
		slog.String("discussion_id", comment.DiscussionID()),
		slog.String("comment_id", comment.ID()),
		slog.String("type", comment.Type()),
		slog.String("content", comment.Content()),
		slog.String("created_by", createdBy),
	)
}

func (s *slogAuditService) LogDiscussionCreated(ctx context.Context, discussion *domain.Discussion) {
	slog.InfoContext(ctx, "discussion created",
		slog.String("category", "audit"),
		slog.String("discussion_id", discussion.ID()),
		slog.String("workspace_id", discussion.WorkspaceID()),
		slog.String("project_id", discussion.ProjectID()),
		slog.String("theme", discussion.Theme()),
		slog.String("premise", discussion.Premise()),
		slog.String("status", string(discussion.Status())),
		slog.String("created_by", discussion.CreatedBy()),
		slog.Time("created_at", discussion.CreatedAt()),
	)
}

func (s *slogAuditService) LogDiscussionUpdated(ctx context.Context, discussion *domain.Discussion) {
	slog.InfoContext(ctx, "discussion updated",
		slog.String("category", "audit"),
		slog.String("discussion_id", discussion.ID()),
		slog.String("workspace_id", discussion.WorkspaceID()),
		slog.String("theme", discussion.Theme()),
		slog.String("premise", discussion.Premise()),
		slog.String("conclusion", discussion.Conclusion()),
	)
}
