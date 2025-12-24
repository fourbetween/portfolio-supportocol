package discussion

import "time"

type (
	// CommentStatus はコメントの状態を表す
	CommentStatus string

	Comment struct {
		id              string
		discussionID    string
		parentCommentID string
		commentTypeID   string
		content         string
		postedBy        string
		createdAt       time.Time
		status          CommentStatus

		repo Repository
	}

	UpdateCommentParams struct {
		Content string
		Status  CommentStatus
	}
)

const (
	// CommentStatus の定数値
	CommentStatusUnassigned CommentStatus = "unassigned"
	CommentStatusAssigned   CommentStatus = "assigned"
	CommentStatusArchived   CommentStatus = "archived"
	CommentStatusDeleted    CommentStatus = "deleted"
)

func (c *Comment) ID() string {
	return c.id
}

func (c *Comment) DiscussionID() string {
	return c.discussionID
}

func (c *Comment) ParentCommentID() string {
	return c.parentCommentID
}

func (c *Comment) CommentTypeID() string {
	return c.commentTypeID
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

func (c *Comment) Status() CommentStatus {
	return c.status
}

func (c *Comment) update(params UpdateCommentParams) {
	c.content = params.Content
	c.status = params.Status
}

func (c *Comment) save() error {
	return c.repo.SaveComment(c)
}

func (c *Comment) delete() error {
	return c.repo.DeleteComment(c)
}
