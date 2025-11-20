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

func (d *Discussion) Comments() ([]*Comment, error) {
	return d.repo.FetchComments(d.id)
}

func (d *Discussion) Issues() ([]*Issue, error) {
	return nil, nil
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
