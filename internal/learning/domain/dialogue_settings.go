package domain

type DialogueSettings struct {
	DiscussionID string
	CommentFrame CommentFrame
}

type CommentFrame struct {
	Types []string
	Paths []CommentPath
}

type CommentPath struct {
	Child  string
	Parent string
}
