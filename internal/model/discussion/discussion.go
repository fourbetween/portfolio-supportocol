package discussion

import "time"

type (
	// visibilityLevel は議論の公開レベルを表す
	visibilityLevel string

	// commentPermissionLevel はコメント許可レベルを表す
	commentPermissionLevel string

	// discussionStatus は議論の状態を表す
	discussionStatus string

	Discussion struct {
		id                     string
		theme                  string
		background             string
		conclusion             string
		ruleID                 string
		visibilityLevel        visibilityLevel
		commentPermissionLevel commentPermissionLevel
		createdBy              string
		createdAt              time.Time
		status                 discussionStatus
	}
)

const (
	// visibilityLevel の定数値
	visibilityLevelEveryone      visibilityLevel = "everyone"
	visibilityLevelAuthenticated visibilityLevel = "authenticated"
	visibilityLevelOwner         visibilityLevel = "owner"

	// commentPermissionLevel の定数値
	commentPermissionLevelEveryone      commentPermissionLevel = "everyone"
	commentPermissionLevelAuthenticated commentPermissionLevel = "authenticated"
	commentPermissionLevelOwner         commentPermissionLevel = "owner"

	// discussionStatus の定数値
	discussionStatusOpen     discussionStatus = "open"
	discussionStatusClosed   discussionStatus = "closed"
	discussionStatusArchived discussionStatus = "archived"
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

func (d Discussion) Conclusion() string {
	return d.conclusion
}

func (d Discussion) RuleID() string {
	return d.ruleID
}

func (d Discussion) VisibilityLevel() visibilityLevel {
	return d.visibilityLevel
}

func (d Discussion) CommentPermissionLevel() commentPermissionLevel {
	return d.commentPermissionLevel
}

func (d Discussion) CreatedBy() string {
	return d.createdBy
}

func (d Discussion) CreatedAt() time.Time {
	return d.createdAt
}

func (d Discussion) Status() discussionStatus {
	return d.status
}
