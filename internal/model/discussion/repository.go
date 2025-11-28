package discussion

//go:generate mockgen -source=$GOFILE -destination=repository_mock.go -package=$GOPACKAGE

type (
	SearchParams struct {
		ProjectID string
	}

	LoadParams struct {
		ID string
	}

	LoadCommentParams struct {
		DiscussionID string
		CommentID    string
	}

	LoadIssueParams struct {
		DiscussionID string
		IssueID      string
	}

	LoadNoteParams struct {
		DiscussionID string
		NoteID       string
	}

	Repository interface {
		Search(params SearchParams) ([]*Discussion, error)
		Load(params LoadParams) (*Discussion, error)
		Save(discussion *Discussion) error
		Delete(discussion *Discussion) error
		FetchComments(discussionID string) ([]*Comment, error)
		LoadComment(params LoadCommentParams) (*Comment, error)
		SaveComment(comment *Comment) error
		DeleteComment(comment *Comment) error
		FetchIssues(discussionID string) ([]*Issue, error)
		LoadIssue(params LoadIssueParams) (*Issue, error)
		SaveIssue(issue *Issue) error
		DeleteIssue(issue *Issue) error
		FetchNotes(discussionID string) ([]*Note, error)
		LoadNote(params LoadNoteParams) (*Note, error)
		SaveNote(note *Note) error
		DeleteNote(note *Note) error
	}
)
