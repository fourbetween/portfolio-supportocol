package domain

import "time"

type Comment struct {
	id              string
	discussionID    string
	parentCommentID string
	commentType     string
	content         string
	postedBy        string
	createdAt       time.Time
}

func (c *Comment) ID() string {
	return c.id
}

func (c *Comment) DiscussionID() string {
	return c.discussionID
}

func (c *Comment) ParentCommentID() string {
	return c.parentCommentID
}

func (c *Comment) CommentType() string {
	return c.commentType
}

func (c *Comment) Content() string {
	return c.content
}

func (c *Comment) PostedBy() string {
	return c.postedBy
}

func (c *Comment) CreatedAt() time.Time {
	return c.createdAt
}
