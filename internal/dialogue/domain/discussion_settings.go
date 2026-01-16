package domain

type DiscussionSettings struct {
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
