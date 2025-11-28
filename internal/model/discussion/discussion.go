package discussion

import "time"

type (
	// VisibilityLevel は議論の公開レベルを表す
	VisibilityLevel string

	// CommentPermissionLevel はコメント許可レベルを表す
	CommentPermissionLevel string

	// Status は議論の状態を表す
	Status string

	Discussion struct {
		id                     string
		theme                  string
		background             string
		conclusion             string
		ruleID                 string
		visibilityLevel        VisibilityLevel
		commentPermissionLevel CommentPermissionLevel
		createdBy              string
		createdAt              time.Time
		status                 Status

		repo Repository
		fac  *Factory
	}

	UpdateParams struct {
		Theme                  string
		Background             string
		Conclusion             string
		RuleID                 string
		VisibilityLevel        VisibilityLevel
		CommentPermissionLevel CommentPermissionLevel
		Status                 Status
	}

	CreateCommentParams struct {
		ParentCommentID string
		CommentTypeID   string
		Content         string
		PostedBy        string
	}

	DiscussionUpdateCommentParams struct {
		CommentID string
		Content   string
		Status    CommentStatus
	}
)

const (
	// VisibilityLevel の定数値
	VisibilityLevelEveryone      VisibilityLevel = "everyone"
	VisibilityLevelAuthenticated VisibilityLevel = "authenticated"
	VisibilityLevelOwner         VisibilityLevel = "owner"

	// CommentPermissionLevel の定数値
	CommentPermissionLevelEveryone      CommentPermissionLevel = "everyone"
	CommentPermissionLevelAuthenticated CommentPermissionLevel = "authenticated"
	CommentPermissionLevelOwner         CommentPermissionLevel = "owner"

	// Status の定数値
	StatusOpen     Status = "open"
	StatusClosed   Status = "closed"
	StatusArchived Status = "archived"
)

func (d *Discussion) ID() string {
	return d.id
}

func (d *Discussion) Theme() string {
	return d.theme
}

func (d *Discussion) Background() string {
	return d.background
}

func (d *Discussion) Conclusion() string {
	return d.conclusion
}

func (d *Discussion) RuleID() string {
	return d.ruleID
}

func (d *Discussion) VisibilityLevel() VisibilityLevel {
	return d.visibilityLevel
}

func (d *Discussion) CommentPermissionLevel() CommentPermissionLevel {
	return d.commentPermissionLevel
}

func (d *Discussion) CreatedBy() string {
	return d.createdBy
}

func (d *Discussion) CreatedAt() time.Time {
	return d.createdAt
}

func (d *Discussion) Status() Status {
	return d.status
}

func (d *Discussion) ListComments() ([]*Comment, error) {
	return d.repo.FetchComments(d.id)
}

func (d *Discussion) LoadComment(commentID string) (*Comment, error) {
	return d.repo.LoadComment(LoadCommentParams{
		DiscussionID: d.id,
		CommentID:    commentID,
	})
}

func (d *Discussion) CreateComment(params CreateCommentParams) (*Comment, error) {
	c := d.fac.NewComment(NewCommentParams{
		DiscussionID:    d.id,
		ParentCommentID: params.ParentCommentID,
		CommentTypeID:   params.CommentTypeID,
		Content:         params.Content,
		PostedBy:        params.PostedBy,
	})
	if err := c.save(); err != nil {
		return nil, err
	}
	return c, nil
}

func (d *Discussion) UpdateComment(params DiscussionUpdateCommentParams) (*Comment, error) {
	c, err := d.LoadComment(params.CommentID)
	if err != nil {
		return nil, err
	}
	c.update(UpdateCommentParams{
		Content: params.Content,
		Status:  params.Status,
	})
	if err := c.save(); err != nil {
		return nil, err
	}
	return c, nil
}

func (d *Discussion) DeleteComment(commentID string) error {
	c, err := d.LoadComment(commentID)
	if err != nil {
		return err
	}
	return c.delete()
}

func (d *Discussion) Issues() ([]*Issue, error) {
	return d.repo.FetchIssues(d.id)
}

func (d *Discussion) LoadIssue(issueID string) (*Issue, error) {
	return d.repo.LoadIssue(LoadIssueParams{
		DiscussionID: d.id,
		IssueID:      issueID,
	})
}

type CreateIssueParams struct {
	CommentID   string
	IssueType   IssueType
	Description string
	CreatedBy   string
}

func (d *Discussion) CreateIssue(params CreateIssueParams) (*Issue, error) {
	i := d.fac.NewIssue(NewIssueParams{
		CommentID:   params.CommentID,
		IssueType:   params.IssueType,
		Description: params.Description,
		CreatedBy:   params.CreatedBy,
	})
	if err := i.save(); err != nil {
		return nil, err
	}
	return i, nil
}

type DiscussionUpdateIssueParams struct {
	IssueID     string
	IssueType   IssueType
	Description string
}

func (d *Discussion) UpdateIssue(params DiscussionUpdateIssueParams) (*Issue, error) {
	i, err := d.LoadIssue(params.IssueID)
	if err != nil {
		return nil, err
	}
	i.update(UpdateIssueParams{
		IssueType:   params.IssueType,
		Description: params.Description,
	})
	if err := i.save(); err != nil {
		return nil, err
	}
	return i, nil
}

func (d *Discussion) DeleteIssue(issueID string) error {
	i, err := d.LoadIssue(issueID)
	if err != nil {
		return err
	}
	return i.delete()
}

func (d *Discussion) Notes() ([]*Note, error) {
	return d.repo.FetchNotes(d.id)
}

func (d *Discussion) LoadNote(noteID string) (*Note, error) {
	return d.repo.LoadNote(LoadNoteParams{
		DiscussionID: d.id,
		NoteID:       noteID,
	})
}

type CreateNoteParams struct {
	Content  string
	PostedBy string
}

func (d *Discussion) CreateNote(params CreateNoteParams) (*Note, error) {
	n := d.fac.NewNote(NewNoteParams{
		DiscussionID: d.id,
		Content:      params.Content,
		PostedBy:     params.PostedBy,
	})
	if err := n.save(); err != nil {
		return nil, err
	}
	return n, nil
}

type DiscussionUpdateNoteParams struct {
	NoteID  string
	Content string
}

func (d *Discussion) UpdateNote(params DiscussionUpdateNoteParams) (*Note, error) {
	n, err := d.LoadNote(params.NoteID)
	if err != nil {
		return nil, err
	}
	n.update(UpdateNoteParams{
		Content: params.Content,
	})
	if err := n.save(); err != nil {
		return nil, err
	}
	return n, nil
}

func (d *Discussion) DeleteNote(noteID string) error {
	n, err := d.LoadNote(noteID)
	if err != nil {
		return err
	}
	return n.delete()
}

func (d *Discussion) Save() error {
	return d.repo.Save(d)
}

func (d *Discussion) Delete() error {
	return d.repo.Delete(d)
}

func (d *Discussion) Update(params UpdateParams) {
	d.theme = params.Theme
	d.background = params.Background
	d.conclusion = params.Conclusion
	d.ruleID = params.RuleID
	d.visibilityLevel = params.VisibilityLevel
	d.commentPermissionLevel = params.CommentPermissionLevel
	d.status = params.Status
}
