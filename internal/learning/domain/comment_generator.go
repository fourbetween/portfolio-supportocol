package domain

type GenerateCommentParams struct {
	DiscussionID    string
	ParentCommentID *string
	CommentType     string
}

type CommentGenerator interface {
	Generate(params GenerateCommentParams) ([]*Comment, error)
}
