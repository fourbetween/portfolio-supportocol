package domain

import "context"

type AuditService interface {
	LogCommentCreated(ctx context.Context, comment *Comment)
	LogCommentUpdated(ctx context.Context, comment *Comment)
	LogDiscussionCreated(ctx context.Context, discussion *Discussion)
	LogDiscussionUpdated(ctx context.Context, discussion *Discussion)
}
