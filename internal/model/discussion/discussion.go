package discussion

import "time"

type (
	Discussion struct {
		id                     string
		theme                  string
		background             string
		ruleID                 string
		visibilityLevel        string
		commentPermissionLevel string
		groupID                *string
		createdBy              string
		createdAt              time.Time
	}
)

func (d Discussion) ID() string {
	return d.id
}

func (d Discussion) Theme() string {
	return d.theme
}

func (d Discussion) Background() string {
	return d.background
}

func (d Discussion) RuleID() string {
	return d.ruleID
}

func (d Discussion) VisibilityLevel() string {
	return d.visibilityLevel
}

func (d Discussion) CommentPermissionLevel() string {
	return d.commentPermissionLevel
}

func (d Discussion) GroupID() *string {
	return d.groupID
}

func (d Discussion) CreatedBy() string {
	return d.createdBy
}

func (d Discussion) CreatedAt() time.Time {
	return d.createdAt
}
