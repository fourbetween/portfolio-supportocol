package adapter

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
)

type AIUsageAdapter struct {
	ws usecase.AIUsageService
}

func NewAIUsageAdapter(ws usecase.AIUsageService) *AIUsageAdapter {
	return &AIUsageAdapter{ws: ws}
}

func (a *AIUsageAdapter) CheckCommentGenerationLimit(ctx context.Context, workspaceID string) error {
	return a.ws.CheckAIUsageLimit(ctx, workspaceID)
}

func (a *AIUsageAdapter) RecordCommentGeneration(ctx context.Context, workspaceID, discussionID string) error {
	return a.ws.RecordAIUsage(ctx, usecase.RecordAIUsageParams{
		WorkspaceID:  workspaceID,
		DiscussionID: discussionID,
	})
}
