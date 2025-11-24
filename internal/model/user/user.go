package user

import (
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
)

type (
	User struct {
		id    string
		email string

		workbookRepo   workbook.Repository
		projectRepo    project.Repository
		ruleRepo       rule.Repository
		discussionRepo discussion.Repository
		projectFac     *project.Factory
		ruleFac        *rule.Factory
		discussionFac  *discussion.Factory
		clockSrv       clock.Service
	}

	LoadProjectParams struct {
		ProjectID string
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

	LoadRuleParams struct {
		RuleID string
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

	LoadDiscussionParams struct {
		DiscussionID string
	}

	ListDiscussionsParams struct {
		ProjectID string
	}

	CreateDiscussionParams struct {
		Theme                  string
		Background             string
		Conclusion             string
		RuleID                 string
		VisibilityLevel        discussion.VisibilityLevel
		CommentPermissionLevel discussion.CommentPermissionLevel
	}

	UpdateDiscussionParams struct {
		DiscussionID           string
		Theme                  string
		Background             string
		Conclusion             string
		RuleID                 string
		VisibilityLevel        discussion.VisibilityLevel
		CommentPermissionLevel discussion.CommentPermissionLevel
		Status                 discussion.Status
	}

	DeleteDiscussionParams struct {
		DiscussionID string
	}
)

func (u *User) ID() string {
	return u.id
}

func (u *User) Email() string {
	return u.email
}

func (u *User) LoadProject(params LoadProjectParams) (*project.Project, error) {
	return u.projectRepo.Load(project.LoadParams{
		ID:        params.ProjectID,
		CreatedBy: u.id,
	})
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

func (u *User) LoadRule(params LoadRuleParams) (*rule.Rule, error) {
	return u.ruleRepo.Load(rule.LoadParams{
		ID:        params.RuleID,
		CreatedBy: u.id,
	})
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

func (u *User) LoadDiscussion(params LoadDiscussionParams) (*discussion.Discussion, error) {
	return u.discussionRepo.Load(discussion.LoadParams{
		ID: params.DiscussionID,
	})
}

func (u *User) ListDiscussions(params ListDiscussionsParams) ([]*discussion.Discussion, error) {
	return u.discussionRepo.Search(discussion.SearchParams{
		ProjectID: params.ProjectID,
	})
}

func (u *User) CreateDiscussion(params CreateDiscussionParams) (*discussion.Discussion, error) {
	d := u.discussionFac.NewDiscussion(discussion.NewDiscussionParams{
		Theme:                  params.Theme,
		Background:             params.Background,
		Conclusion:             params.Conclusion,
		RuleID:                 params.RuleID,
		VisibilityLevel:        params.VisibilityLevel,
		CommentPermissionLevel: params.CommentPermissionLevel,
		CreatedBy:              u.id,
		Status:                 discussion.StatusOpen,
	})

	if err := d.Save(); err != nil {
		return nil, err
	}

	return d, nil
}

func (u *User) UpdateDiscussion(params UpdateDiscussionParams) (*discussion.Discussion, error) {
	d, err := u.discussionRepo.Load(discussion.LoadParams{
		ID: params.DiscussionID,
	})
	if err != nil {
		return nil, err
	}

	d.Update(discussion.UpdateParams{
		Theme:                  params.Theme,
		Background:             params.Background,
		Conclusion:             params.Conclusion,
		RuleID:                 params.RuleID,
		VisibilityLevel:        params.VisibilityLevel,
		CommentPermissionLevel: params.CommentPermissionLevel,
		Status:                 params.Status,
	})

	if err := d.Save(); err != nil {
		return nil, err
	}

	return d, nil
}

func (u *User) DeleteDiscussion(params DeleteDiscussionParams) error {
	d, err := u.discussionRepo.Load(discussion.LoadParams{
		ID: params.DiscussionID,
	})
	if err != nil {
		return err
	}

	return d.Delete()
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
