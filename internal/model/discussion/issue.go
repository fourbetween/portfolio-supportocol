package discussion

import "time"

type (
	// IssueType は指摘の種類を表す
	IssueType string

	Issue struct {
		id          string
		commentID   string
		issueType   IssueType
		description string
		createdBy   string
		createdAt   time.Time

		repo Repository
	}

	UpdateIssueParams struct {
		IssueType   IssueType
		Description string
	}
)

const (
	// IssueType の定数値
	IssueTypeContradiction IssueType = "contradiction"  // 矛盾
	IssueTypeCircularLogic IssueType = "circular_logic" // 循環論法
)

func (i *Issue) ID() string {
	return i.id
}

func (i *Issue) CommentID() string {
	return i.commentID
}

func (i *Issue) IssueType() IssueType {
	return i.issueType
}

func (i *Issue) Description() string {
	return i.description
}

func (i *Issue) CreatedBy() string {
	return i.createdBy
}

func (i *Issue) CreatedAt() time.Time {
	return i.createdAt
}

func (i *Issue) update(params UpdateIssueParams) {
	i.issueType = params.IssueType
	i.description = params.Description
}

func (i *Issue) save() error {
	return i.repo.SaveIssue(i)
}

func (i *Issue) delete() error {
	return i.repo.DeleteIssue(i)
}
