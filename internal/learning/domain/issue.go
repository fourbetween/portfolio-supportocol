package domain

type Issue struct {
	id          string
	issueType   string
	description string
	status      IssueStatus
}

func (i *Issue) ID() string {
	return i.id
}

func (i *Issue) IssueType() string {
	return i.issueType
}

func (i *Issue) Description() string {
	return i.description
}

func (i *Issue) Status() IssueStatus {
	return i.status
}

func (i *Issue) Validate() error {
	return nil
}
