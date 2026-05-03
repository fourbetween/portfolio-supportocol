package domain

import "context"

type AIUsageService interface {
	CheckCommentGenerationLimit(ctx context.Context, workspaceID string) error
	RecordCommentGeneration(ctx context.Context, workspaceID, discussionID string, tokens int32) error
}
