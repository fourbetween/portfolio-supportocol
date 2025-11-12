package workbook

type (
	Workbook struct {
		id      string
		title   string
		status  Status
		ownerID string

		repo Repository
	}
)

func (w Workbook) ID() string {
	return w.id
}

func (w Workbook) Title() string {
	return w.title
}

func (w Workbook) Status() Status {
	return w.status
}

func (w Workbook) OwnerID() string {
	return w.ownerID
}

func (w Workbook) IsPublished() bool {
	return w.status == StatusPublished
}
