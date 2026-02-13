package domain

import "context"

type AuditService interface {
	LogCommentCreated(ctx context.Context, comment *Comment)
	LogCommentIssueAdded(ctx context.Context, comment *Comment, issue CommentIssue)
}
