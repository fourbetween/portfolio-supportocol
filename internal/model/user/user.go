package user

import (
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
)

type (
	User struct {
		id    string
		email string

		workbookRepo workbook.Repository
		projectRepo  project.Repository
		ruleRepo     rule.Repository
		projectFac   *project.Factory
		ruleFac      *rule.Factory
		clockSrv     clock.Service
	}

	CreateProjectParams struct {
		Name string
	}

	UpdateProjectParams struct {
		ProjectID string
		Name      string
	}

	DeleteProjectParams struct {
		ProjectID string
	}

	CreateRuleParams struct {
		Name             string
		Description      string
		CommentTypes     []rule.CommentType
		CommentTypePaths []rule.CommentTypePath
	}

	UpdateRuleParams struct {
		RuleID           string
		Name             string
		Description      string
		CommentTypes     []rule.CommentType
		CommentTypePaths []rule.CommentTypePath
	}

	DeleteRuleParams struct {
		RuleID string
	}
)

func (u *User) ID() string {
	return u.id
}

func (u *User) Email() string {
	return u.email
}

func (u *User) ListProjects() ([]*project.Project, error) {
	return u.projectRepo.Search(project.SearchParams{
		CreatedBy: u.id,
	})
}

func (u *User) CreateProject(params CreateProjectParams) (*project.Project, error) {
	p := u.projectFac.NewProject(project.NewProjectParams{
		Name:      params.Name,
		CreatedBy: u.id,
		CreatedAt: u.clockSrv.Now(),
	})

	if err := p.Save(); err != nil {
		return nil, err
	}

	return p, nil
}

func (u *User) UpdateProject(params UpdateProjectParams) (*project.Project, error) {
	p, err := u.projectRepo.Load(project.LoadParams{
		ID:        params.ProjectID,
		CreatedBy: u.id,
	})
	if err != nil {
		return nil, err
	}

	p.UpdateName(params.Name)

	if err := p.Save(); err != nil {
		return nil, err
	}

	return p, nil
}

func (u *User) DeleteProject(params DeleteProjectParams) error {
	p, err := u.projectRepo.Load(project.LoadParams{
		ID:        params.ProjectID,
		CreatedBy: u.id,
	})
	if err != nil {
		return err
	}

	return p.Delete()
}

func (u *User) ListRules() ([]*rule.Rule, error) {
	return u.ruleRepo.Search(rule.SearchParams{
		CreatedBy: u.id,
	})
}

func (u *User) CreateRule(params CreateRuleParams) (*rule.Rule, error) {
	r := u.ruleFac.NewRule(rule.NewRuleParams{
		Name:             params.Name,
		Description:      params.Description,
		CreatedBy:        u.id,
		CreatedAt:        u.clockSrv.Now(),
		CommentTypes:     params.CommentTypes,
		CommentTypePaths: params.CommentTypePaths,
	})

	if err := r.Save(); err != nil {
		return nil, err
	}

	return r, nil
}

func (u *User) UpdateRule(params UpdateRuleParams) (*rule.Rule, error) {
	r, err := u.ruleRepo.Load(rule.LoadParams{
		ID:        params.RuleID,
		CreatedBy: u.id,
	})
	if err != nil {
		return nil, err
	}

	r.Update(rule.UpdateParams{
		Name:             params.Name,
		Description:      params.Description,
		CommentTypes:     params.CommentTypes,
		CommentTypePaths: params.CommentTypePaths,
	})

	if err := r.Save(); err != nil {
		return nil, err
	}

	return r, nil
}

func (u *User) DeleteRule(params DeleteRuleParams) error {
	r, err := u.ruleRepo.Load(rule.LoadParams{
		ID:        params.RuleID,
		CreatedBy: u.id,
	})
	if err != nil {
		return err
	}

	return r.Delete()
}

func (u *User) LoadWorkbook(workbookID string) (*workbook.Workbook, error) {
	return u.workbookRepo.Load(workbook.LoadParams{
		ID:      workbookID,
		OwnerID: u.id,
	})
}

func (u *User) SearchWorkbooks() ([]*workbook.Workbook, error) {
	return u.workbookRepo.Search(workbook.SearchParams{
		OwnerID: u.id,
	})
}
