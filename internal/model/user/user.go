package user

import (
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
)

type (
	User struct {
		id    string
		email string

		workbookRepo workbook.Repository
	}
)

func (u User) ID() string {
	return u.id
}

func (u User) Email() string {
	return u.email
}

func (u User) LoadWorkbook(workbookID string) (workbook.Workbook, error) {
	return u.workbookRepo.Load(workbook.LoadParams{
		ID:      workbookID,
		OwnerID: u.id,
	})
}

func (u User) SearchWorkbooks() ([]workbook.Workbook, error) {
	return u.workbookRepo.Search(workbook.SearchParams{
		OwnerID: u.id,
	})
}
