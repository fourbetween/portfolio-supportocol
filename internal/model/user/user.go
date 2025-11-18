package user

import (
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
)

type (
	User struct {
		id    string
		email string

		workbookRepo workbook.Repository
		projectFac   *project.Factory
		clockSrv     clock.Service
	}

	CreateProjectParams struct {
		Name string
	}
)

func (u User) ID() string {
	return u.id
}

func (u User) Email() string {
	return u.email
}

func (u User) CreateProject(params CreateProjectParams) (project.Project, error) {
	p := u.projectFac.NewProject(project.NewProjectParams{
		Name:      params.Name,
		CreatedBy: u.id,
		CreatedAt: u.clockSrv.Now(),
	})

	if err := p.Save(); err != nil {
		return project.Project{}, err
	}

	return p, nil
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
