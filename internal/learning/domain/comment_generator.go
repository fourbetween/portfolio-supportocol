package domain

import "context"

type GenerateCommentParams struct {
	DiscussionID    string
	WorkspaceID     string
	ParentCommentID *string
	CommentType     string
	UserID          string
}

type CommentGenerator interface {
	Generate(ctx context.Context, params GenerateCommentParams) ([]*Comment, error)
}
