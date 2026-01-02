package domain

import "context"

type GenerateCommentParams struct {
	DiscussionID    string
	ParentCommentID *string
	CommentType     string
}

type CommentGenerator interface {
	Generate(ctx context.Context, params GenerateCommentParams) ([]*Comment, error)
}
