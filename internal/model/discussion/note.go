package discussion

import "time"

type (
	Note struct {
		id           string
		discussionID string
		content      string
		postedBy     string
		postedAt     time.Time

		repo Repository
	}

	UpdateNoteParams struct {
		Content string
	}
)

func (n *Note) ID() string {
	return n.id
}

func (n *Note) DiscussionID() string {
	return n.discussionID
}

func (n *Note) Content() string {
	return n.content
}

func (n *Note) PostedBy() string {
	return n.postedBy
}

func (n *Note) PostedAt() time.Time {
	return n.postedAt
}

func (n *Note) update(params UpdateNoteParams) {
	n.content = params.Content
}

func (n *Note) save() error {
	return n.repo.SaveNote(n)
}

func (n *Note) delete() error {
	return n.repo.DeleteNote(n)
}
