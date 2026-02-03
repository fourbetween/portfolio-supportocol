package domain

type CommentIssue struct {
	ID          string
	Title       string
	Description string
	CreatedBy   *string
}
