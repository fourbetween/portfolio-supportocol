package domain

func NewPersonalWorkspaceID(userID string) string {
	return "personal-" + userID
}
