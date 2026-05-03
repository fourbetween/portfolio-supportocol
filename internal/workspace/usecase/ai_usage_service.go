package usecase

import "context"

type RecordAIUsageParams struct {
	WorkspaceID  string
	DiscussionID string
	Tokens       int32
}

type AIUsageService interface {
	CheckAIUsageLimit(ctx context.Context, workspaceID string) error
	RecordAIUsage(ctx context.Context, params RecordAIUsageParams) error
}
