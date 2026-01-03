package domain

type CommentGenerationQueue interface {
	Enqueue(params []GenerateCommentParams) error
}
