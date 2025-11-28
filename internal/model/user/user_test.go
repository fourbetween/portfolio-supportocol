package user_test

import (
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
	"github.com/fourbetween/app-supportocol/internal/service/id"
	"go.uber.org/mock/gomock"
)

type container struct {
	t *testing.T

	UserFac    *user.Factory
	ProjectFac *project.Factory
	RuleFac    *rule.Factory

	WorkbookRepo   *workbook.MockRepository
	ProjectRepo    *project.MockRepository
	RuleRepo       *rule.MockRepository
	DiscussionRepo *discussion.MockRepository
	DiscussionFac  *discussion.Factory
	IDSrv          *id.MockService
	ClockSrv       *clock.MockService
}

func newContainer(t *testing.T) *container {
	t.Helper()

	ctrl := gomock.NewController(t)

	workbookRepo := workbook.NewMockRepository(ctrl)
	projectRepo := project.NewMockRepository(ctrl)
	ruleRepo := rule.NewMockRepository(ctrl)
	discussionRepo := discussion.NewMockRepository(ctrl)
	idSrv := id.NewMockService(ctrl)
	clockSrv := clock.NewMockService(ctrl)

	projectFac := project.NewFactory(projectRepo, idSrv)
	ruleFac := rule.NewFactory(ruleRepo, idSrv)
	discussionFac := discussion.NewFactory(discussionRepo, idSrv, clockSrv)
	userFac := user.NewFactory(workbookRepo, projectRepo, ruleRepo, discussionRepo, projectFac, ruleFac, discussionFac, clockSrv)

	return &container{
		t:              t,
		UserFac:        userFac,
		ProjectFac:     projectFac,
		RuleFac:        ruleFac,
		DiscussionFac:  discussionFac,
		WorkbookRepo:   workbookRepo,
		ProjectRepo:    projectRepo,
		RuleRepo:       ruleRepo,
		DiscussionRepo: discussionRepo,
		IDSrv:          idSrv,
		ClockSrv:       clockSrv,
	}
}

func TestUser_IsPointer(t *testing.T) {
	tests := []struct {
		name   string
		verify func(*testing.T, *user.User)
	}{
		{
			name: "Userがポインタで扱われること",
			verify: func(t *testing.T, got *user.User) {
				t.Helper()
				if got == nil {
					t.Error("User should not be nil")
					return
				}
				if got.ID() != "test-user-id" {
					t.Errorf("User.ID() = %v, want %v", got.ID(), "test-user-id")
				}
				if got.Email() != "test@example.com" {
					t.Errorf("User.Email() = %v, want %v", got.Email(), "test@example.com")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)

			got := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			if tt.verify != nil {
				tt.verify(t, got)
			}
		})
	}
}

func TestUser_CreateProject(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		params user.CreateProjectParams
		setup  func(*container)
		verify func(*testing.T, *project.Project, error)
	}{
		{
			name: "プロジェクトを作成できること",
			params: user.CreateProjectParams{
				Name: "テストプロジェクト",
			},
			setup: func(con *container) {
				con.ClockSrv.EXPECT().Now().Return(fixedTime)
				con.IDSrv.EXPECT().Generate().Return("generated-id")
				con.ProjectRepo.EXPECT().Save(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, got *project.Project, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("CreateProject() failed: %v", err)
					return
				}
				if got.ID() == "" {
					t.Error("CreateProject() ID is empty")
				}
				if got.Name() != "テストプロジェクト" {
					t.Errorf("CreateProject() Name = %v, want %v", got.Name(), "テストプロジェクト")
				}
				if got.CreatedBy() != "test-user-id" {
					t.Errorf("CreateProject() CreatedBy = %v, want %v", got.CreatedBy(), "test-user-id")
				}
				if got.CreatedAt().IsZero() {
					t.Error("CreateProject() CreatedAt is zero")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.CreateProject(tt.params)

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_UpdateProject(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		params user.UpdateProjectParams
		setup  func(*container)
		verify func(*testing.T, *project.Project, error)
	}{
		{
			name: "プロジェクトを更新できること",
			params: user.UpdateProjectParams{
				ProjectID: "existing-project-id",
				Name:      "更新されたプロジェクト名",
			},
			setup: func(con *container) {
				existingProject := con.ProjectFac.BuildProject(project.BuildProjectParams{
					ID: "existing-project-id",
					NewProjectParams: project.NewProjectParams{
						Name:      "元のプロジェクト名",
						CreatedBy: "test-user-id",
						CreatedAt: fixedTime,
					},
				})
				con.ProjectRepo.EXPECT().Load(project.LoadParams{
					ID:        "existing-project-id",
					CreatedBy: "test-user-id",
				}).Return(existingProject, nil)
				con.ProjectRepo.EXPECT().Save(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, got *project.Project, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("UpdateProject() failed: %v", err)
					return
				}
				if got.ID() != "existing-project-id" {
					t.Errorf("UpdateProject() ID = %v, want %v", got.ID(), "existing-project-id")
				}
				if got.Name() != "更新されたプロジェクト名" {
					t.Errorf("UpdateProject() Name = %v, want %v", got.Name(), "更新されたプロジェクト名")
				}
				if got.CreatedBy() != "test-user-id" {
					t.Errorf("UpdateProject() CreatedBy = %v, want %v", got.CreatedBy(), "test-user-id")
				}
			},
		},
		{
			name: "存在しないプロジェクトの場合にエラーを返すこと",
			params: user.UpdateProjectParams{
				ProjectID: "non-existent-project-id",
				Name:      "更新されたプロジェクト名",
			},
			setup: func(con *container) {
				con.ProjectRepo.EXPECT().Load(project.LoadParams{
					ID:        "non-existent-project-id",
					CreatedBy: "test-user-id",
				}).Return(nil, internal.ErrNotFound)
			},
			verify: func(t *testing.T, got *project.Project, err error) {
				t.Helper()
				if err == nil {
					t.Error("UpdateProject() should return error")
					return
				}
				if err != internal.ErrNotFound {
					t.Errorf("UpdateProject() error = %v, want %v", err, internal.ErrNotFound)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.UpdateProject(tt.params)

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_DeleteProject(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name      string
		projectID string
		setup     func(*container)
		verify    func(*testing.T, error)
	}{
		{
			name:      "プロジェクトを削除できること",
			projectID: "existing-project-id",
			setup: func(con *container) {
				existingProject := con.ProjectFac.BuildProject(project.BuildProjectParams{
					ID: "existing-project-id",
					NewProjectParams: project.NewProjectParams{
						Name:      "削除対象のプロジェクト",
						CreatedBy: "test-user-id",
						CreatedAt: fixedTime,
					},
				})
				con.ProjectRepo.EXPECT().Load(project.LoadParams{
					ID:        "existing-project-id",
					CreatedBy: "test-user-id",
				}).Return(existingProject, nil)
				con.ProjectRepo.EXPECT().Delete(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("DeleteProject() failed: %v", err)
				}
			},
		},
		{
			name:      "存在しないプロジェクトの場合にエラーを返すこと",
			projectID: "non-existent-project-id",
			setup: func(con *container) {
				con.ProjectRepo.EXPECT().Load(project.LoadParams{
					ID:        "non-existent-project-id",
					CreatedBy: "test-user-id",
				}).Return(nil, internal.ErrNotFound)
			},
			verify: func(t *testing.T, err error) {
				t.Helper()
				if err == nil {
					t.Error("DeleteProject() should return error")
					return
				}
				if err != internal.ErrNotFound {
					t.Errorf("DeleteProject() error = %v, want %v", err, internal.ErrNotFound)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			err := u.DeleteProject(user.DeleteProjectParams{
				ProjectID: tt.projectID,
			})

			if tt.verify != nil {
				tt.verify(t, err)
			}
		})
	}
}

func TestUser_ListProjects(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		setup  func(*container) []*project.Project
		verify func(*testing.T, []*project.Project, error)
	}{
		{
			name: "プロジェクトのリストを取得できること",
			setup: func(con *container) []*project.Project {
				expectedProjects := []*project.Project{
					con.ProjectFac.BuildProject(project.BuildProjectParams{
						ID: "project-id-1",
						NewProjectParams: project.NewProjectParams{
							Name:      "プロジェクト1",
							CreatedBy: "test-user-id",
							CreatedAt: fixedTime,
						},
					}),
					con.ProjectFac.BuildProject(project.BuildProjectParams{
						ID: "project-id-2",
						NewProjectParams: project.NewProjectParams{
							Name:      "プロジェクト2",
							CreatedBy: "test-user-id",
							CreatedAt: fixedTime.Add(time.Hour),
						},
					}),
				}
				con.ProjectRepo.EXPECT().Search(project.SearchParams{
					CreatedBy: "test-user-id",
				}).Return(expectedProjects, nil)
				return expectedProjects
			},
			verify: func(t *testing.T, got []*project.Project, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("ListProjects() failed: %v", err)
					return
				}
				if len(got) != 2 {
					t.Errorf("ListProjects() length = %v, want %v", len(got), 2)
					return
				}
				if got[0].ID() != "project-id-1" {
					t.Errorf("ListProjects()[0].ID() = %v, want %v", got[0].ID(), "project-id-1")
				}
				if got[0].Name() != "プロジェクト1" {
					t.Errorf("ListProjects()[0].Name() = %v, want %v", got[0].Name(), "プロジェクト1")
				}
				if got[1].ID() != "project-id-2" {
					t.Errorf("ListProjects()[1].ID() = %v, want %v", got[1].ID(), "project-id-2")
				}
				if got[1].Name() != "プロジェクト2" {
					t.Errorf("ListProjects()[1].Name() = %v, want %v", got[1].Name(), "プロジェクト2")
				}
			},
		},
		{
			name: "プロジェクトが存在しない場合に空のリストを返すこと",
			setup: func(con *container) []*project.Project {
				con.ProjectRepo.EXPECT().Search(project.SearchParams{
					CreatedBy: "test-user-id",
				}).Return([]*project.Project{}, nil)
				return []*project.Project{}
			},
			verify: func(t *testing.T, got []*project.Project, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("ListProjects() failed: %v", err)
					return
				}
				if len(got) != 0 {
					t.Errorf("ListProjects() length = %v, want %v", len(got), 0)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.ListProjects()

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_ListRules(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		setup  func(*container) []*rule.Rule
		verify func(*testing.T, []*rule.Rule, error)
	}{
		{
			name: "ルールのリストを取得できること",
			setup: func(con *container) []*rule.Rule {
				expectedRules := []*rule.Rule{
					con.RuleFac.BuildRule(rule.BuildRuleParams{
						ID: "rule-id-1",
						NewRuleParams: rule.NewRuleParams{
							Name:      "ルール1",
							CreatedBy: "test-user-id",
							CreatedAt: fixedTime,
						},
					}),
					con.RuleFac.BuildRule(rule.BuildRuleParams{
						ID: "rule-id-2",
						NewRuleParams: rule.NewRuleParams{
							Name:      "ルール2",
							CreatedBy: "test-user-id",
							CreatedAt: fixedTime.Add(time.Hour),
						},
					}),
				}
				con.RuleRepo.EXPECT().Search(rule.SearchParams{
					CreatedBy: "test-user-id",
				}).Return(expectedRules, nil)
				return expectedRules
			},
			verify: func(t *testing.T, got []*rule.Rule, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("ListRules() failed: %v", err)
					return
				}
				if len(got) != 2 {
					t.Errorf("ListRules() length = %v, want %v", len(got), 2)
					return
				}
				if got[0].ID() != "rule-id-1" {
					t.Errorf("ListRules()[0].ID() = %v, want %v", got[0].ID(), "rule-id-1")
				}
				if got[0].Name() != "ルール1" {
					t.Errorf("ListRules()[0].Name() = %v, want %v", got[0].Name(), "ルール1")
				}
				if got[1].ID() != "rule-id-2" {
					t.Errorf("ListRules()[1].ID() = %v, want %v", got[1].ID(), "rule-id-2")
				}
				if got[1].Name() != "ルール2" {
					t.Errorf("ListRules()[1].Name() = %v, want %v", got[1].Name(), "ルール2")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.ListRules()

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_CreateRule(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		params user.CreateRuleParams
		setup  func(*container)
		verify func(*testing.T, *rule.Rule, error)
	}{
		{
			name: "ルールを作成できること",
			params: user.CreateRuleParams{
				Name:        "テストルール",
				Description: "テストルールの説明",
			},
			setup: func(con *container) {
				con.ClockSrv.EXPECT().Now().Return(fixedTime)
				con.IDSrv.EXPECT().Generate().Return("generated-rule-id")
				con.RuleRepo.EXPECT().Save(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, got *rule.Rule, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("CreateRule() failed: %v", err)
					return
				}
				if got.ID() == "" {
					t.Error("CreateRule() ID is empty")
				}
				if got.Name() != "テストルール" {
					t.Errorf("CreateRule() Name = %v, want %v", got.Name(), "テストルール")
				}
				if got.Description() != "テストルールの説明" {
					t.Errorf("CreateRule() Description = %v, want %v", got.Description(), "テストルールの説明")
				}
				if got.CreatedBy() != "test-user-id" {
					t.Errorf("CreateRule() CreatedBy = %v, want %v", got.CreatedBy(), "test-user-id")
				}
				if got.CreatedAt().IsZero() {
					t.Error("CreateRule() CreatedAt is zero")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.CreateRule(tt.params)

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_UpdateRule(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		params user.UpdateRuleParams
		setup  func(*container)
		verify func(*testing.T, *rule.Rule, error)
	}{
		{
			name: "ルールを更新できること",
			params: user.UpdateRuleParams{
				RuleID:      "existing-rule-id",
				Name:        "更新されたルール名",
				Description: "更新されたルールの説明",
			},
			setup: func(con *container) {
				existingRule := con.RuleFac.BuildRule(rule.BuildRuleParams{
					ID: "existing-rule-id",
					NewRuleParams: rule.NewRuleParams{
						Name:        "元のルール名",
						Description: "元のルールの説明",
						CreatedBy:   "test-user-id",
						CreatedAt:   fixedTime,
					},
				})
				con.RuleRepo.EXPECT().Load(rule.LoadParams{
					ID:        "existing-rule-id",
					CreatedBy: "test-user-id",
				}).Return(existingRule, nil)
				con.RuleRepo.EXPECT().Save(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, got *rule.Rule, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("UpdateRule() failed: %v", err)
					return
				}
				if got.ID() != "existing-rule-id" {
					t.Errorf("UpdateRule() ID = %v, want %v", got.ID(), "existing-rule-id")
				}
				if got.Name() != "更新されたルール名" {
					t.Errorf("UpdateRule() Name = %v, want %v", got.Name(), "更新されたルール名")
				}
				if got.Description() != "更新されたルールの説明" {
					t.Errorf("UpdateRule() Description = %v, want %v", got.Description(), "更新されたルールの説明")
				}
				if got.CreatedBy() != "test-user-id" {
					t.Errorf("UpdateRule() CreatedBy = %v, want %v", got.CreatedBy(), "test-user-id")
				}
			},
		},
		{
			name: "存在しないルールの場合にエラーを返すこと",
			params: user.UpdateRuleParams{
				RuleID: "non-existent-rule-id",
				Name:   "更新されたルール名",
			},
			setup: func(con *container) {
				con.RuleRepo.EXPECT().Load(rule.LoadParams{
					ID:        "non-existent-rule-id",
					CreatedBy: "test-user-id",
				}).Return(nil, internal.ErrNotFound)
			},
			verify: func(t *testing.T, got *rule.Rule, err error) {
				t.Helper()
				if err == nil {
					t.Error("UpdateRule() should return error")
					return
				}
				if err != internal.ErrNotFound {
					t.Errorf("UpdateRule() error = %v, want %v", err, internal.ErrNotFound)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.UpdateRule(tt.params)

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_DeleteRule(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		ruleID string
		setup  func(*container)
		verify func(*testing.T, error)
	}{
		{
			name:   "ルールを削除できること",
			ruleID: "existing-rule-id",
			setup: func(con *container) {
				existingRule := con.RuleFac.BuildRule(rule.BuildRuleParams{
					ID: "existing-rule-id",
					NewRuleParams: rule.NewRuleParams{
						Name:      "削除対象のルール",
						CreatedBy: "test-user-id",
						CreatedAt: fixedTime,
					},
				})
				con.RuleRepo.EXPECT().Load(rule.LoadParams{
					ID:        "existing-rule-id",
					CreatedBy: "test-user-id",
				}).Return(existingRule, nil)
				con.RuleRepo.EXPECT().Delete(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("DeleteRule() failed: %v", err)
				}
			},
		},
		{
			name:   "存在しないルールの場合にエラーを返すこと",
			ruleID: "non-existent-rule-id",
			setup: func(con *container) {
				con.RuleRepo.EXPECT().Load(rule.LoadParams{
					ID:        "non-existent-rule-id",
					CreatedBy: "test-user-id",
				}).Return(nil, internal.ErrNotFound)
			},
			verify: func(t *testing.T, err error) {
				t.Helper()
				if err == nil {
					t.Error("DeleteRule() should return error")
					return
				}
				if err != internal.ErrNotFound {
					t.Errorf("DeleteRule() error = %v, want %v", err, internal.ErrNotFound)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			err := u.DeleteRule(user.DeleteRuleParams{
				RuleID: tt.ruleID,
			})

			if tt.verify != nil {
				tt.verify(t, err)
			}
		})
	}
}

func TestUser_ListDiscussions(t *testing.T) {
	tests := []struct {
		name      string
		projectID string
		setup     func(*container)
		verify    func(*testing.T, []*discussion.Discussion, error)
	}{
		{
			name:      "プロジェクトIDを指定して議論一覧を取得できること",
			projectID: "test-project-id",
			setup: func(c *container) {
				c.DiscussionRepo.EXPECT().Search(discussion.SearchParams{
					ProjectID: "test-project-id",
				}).Return([]*discussion.Discussion{
					{},
				}, nil)
			},
			verify: func(t *testing.T, got []*discussion.Discussion, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("User.ListDiscussions() error = %v", err)
					return
				}
				if len(got) != 1 {
					t.Errorf("User.ListDiscussions() len = %v, want %v", len(got), 1)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)

			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.ListDiscussions(user.ListDiscussionsParams{
				ProjectID: tt.projectID,
			})

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_CreateDiscussion(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		params user.CreateDiscussionParams
		setup  func(*container)
		verify func(*testing.T, *discussion.Discussion, error)
	}{
		{
			name: "議論を作成できること",
			params: user.CreateDiscussionParams{
				Theme:                  "テストテーマ",
				Background:             "テスト背景",
				Conclusion:             "テスト結論",
				RuleID:                 "test-rule-id",
				VisibilityLevel:        discussion.VisibilityLevelEveryone,
				CommentPermissionLevel: discussion.CommentPermissionLevelEveryone,
			},
			setup: func(con *container) {
				con.ClockSrv.EXPECT().Now().Return(fixedTime)
				con.IDSrv.EXPECT().Generate().Return("generated-discussion-id")
				con.DiscussionRepo.EXPECT().Save(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, got *discussion.Discussion, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("CreateDiscussion() failed: %v", err)
					return
				}
				if got.ID() == "" {
					t.Error("CreateDiscussion() ID is empty")
				}
				if got.Theme() != "テストテーマ" {
					t.Errorf("CreateDiscussion() Theme = %v, want %v", got.Theme(), "テストテーマ")
				}
				if got.Background() != "テスト背景" {
					t.Errorf("CreateDiscussion() Background = %v, want %v", got.Background(), "テスト背景")
				}
				if got.Conclusion() != "テスト結論" {
					t.Errorf("CreateDiscussion() Conclusion = %v, want %v", got.Conclusion(), "テスト結論")
				}
				if got.RuleID() != "test-rule-id" {
					t.Errorf("CreateDiscussion() RuleID = %v, want %v", got.RuleID(), "test-rule-id")
				}
				if got.VisibilityLevel() != discussion.VisibilityLevelEveryone {
					t.Errorf("CreateDiscussion() VisibilityLevel = %v, want %v", got.VisibilityLevel(), discussion.VisibilityLevelEveryone)
				}
				if got.CommentPermissionLevel() != discussion.CommentPermissionLevelEveryone {
					t.Errorf("CreateDiscussion() CommentPermissionLevel = %v, want %v", got.CommentPermissionLevel(), discussion.CommentPermissionLevelEveryone)
				}
				if got.CreatedBy() != "test-user-id" {
					t.Errorf("CreateDiscussion() CreatedBy = %v, want %v", got.CreatedBy(), "test-user-id")
				}
				if got.CreatedAt().IsZero() {
					t.Error("CreateDiscussion() CreatedAt is zero")
				}
				if got.Status() != discussion.StatusOpen {
					t.Errorf("CreateDiscussion() Status = %v, want %v", got.Status(), discussion.StatusOpen)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.CreateDiscussion(tt.params)

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_UpdateDiscussion(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		params user.UpdateDiscussionParams
		setup  func(*container)
		verify func(*testing.T, *discussion.Discussion, error)
	}{
		{
			name: "議論を更新できること",
			params: user.UpdateDiscussionParams{
				DiscussionID:           "existing-discussion-id",
				Theme:                  "更新されたテーマ",
				Background:             "更新された背景",
				Conclusion:             "更新された結論",
				RuleID:                 "updated-rule-id",
				VisibilityLevel:        discussion.VisibilityLevelAuthenticated,
				CommentPermissionLevel: discussion.CommentPermissionLevelAuthenticated,
				Status:                 discussion.StatusClosed,
			},
			setup: func(con *container) {
				existingDiscussion := con.DiscussionFac.BuildDiscussion(discussion.BuildDiscussionParams{
					ID: "existing-discussion-id",
					NewDiscussionParams: discussion.NewDiscussionParams{
						Theme:                  "元のテーマ",
						Background:             "元の背景",
						Conclusion:             "元の結論",
						RuleID:                 "original-rule-id",
						VisibilityLevel:        discussion.VisibilityLevelEveryone,
						CommentPermissionLevel: discussion.CommentPermissionLevelEveryone,
						CreatedBy:              "test-user-id",
						Status:                 discussion.StatusOpen,
					},
					CreatedAt: fixedTime,
				})
				con.DiscussionRepo.EXPECT().Load(discussion.LoadParams{
					ID: "existing-discussion-id",
				}).Return(existingDiscussion, nil)
				con.DiscussionRepo.EXPECT().Save(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, got *discussion.Discussion, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("UpdateDiscussion() failed: %v", err)
					return
				}
				if got.ID() != "existing-discussion-id" {
					t.Errorf("UpdateDiscussion() ID = %v, want %v", got.ID(), "existing-discussion-id")
				}
				if got.Theme() != "更新されたテーマ" {
					t.Errorf("UpdateDiscussion() Theme = %v, want %v", got.Theme(), "更新されたテーマ")
				}
				if got.Status() != discussion.StatusClosed {
					t.Errorf("UpdateDiscussion() Status = %v, want %v", got.Status(), discussion.StatusClosed)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			got, err := u.UpdateDiscussion(tt.params)

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}

func TestUser_DeleteDiscussion(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name         string
		discussionID string
		setup        func(*container)
		verify       func(*testing.T, error)
	}{
		{
			name:         "議論を削除できること",
			discussionID: "existing-discussion-id",
			setup: func(con *container) {
				existingDiscussion := con.DiscussionFac.BuildDiscussion(discussion.BuildDiscussionParams{
					ID: "existing-discussion-id",
					NewDiscussionParams: discussion.NewDiscussionParams{
						Theme:                  "削除対象の議論",
						Background:             "削除対象の背景",
						Conclusion:             "削除対象の結論",
						RuleID:                 "rule-id",
						VisibilityLevel:        discussion.VisibilityLevelEveryone,
						CommentPermissionLevel: discussion.CommentPermissionLevelEveryone,
						CreatedBy:              "test-user-id",
						Status:                 discussion.StatusOpen,
					},
					CreatedAt: fixedTime,
				})
				con.DiscussionRepo.EXPECT().Load(discussion.LoadParams{
					ID: "existing-discussion-id",
				}).Return(existingDiscussion, nil)
				con.DiscussionRepo.EXPECT().Delete(gomock.Any()).Return(nil)
			},
			verify: func(t *testing.T, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("DeleteDiscussion() failed: %v", err)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			if tt.setup != nil {
				tt.setup(con)
			}

			u := con.UserFac.Build(user.BuildParams{
				ID:    "test-user-id",
				Email: "test@example.com",
			})

			err := u.DeleteDiscussion(user.DeleteDiscussionParams{
				DiscussionID: tt.discussionID,
			})

			if tt.verify != nil {
				tt.verify(t, err)
			}
		})
	}
}

func TestUser_ListComments(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		params  user.ListCommentsParams
		want    []*discussion.Comment
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// TODO: construct the receiver type.
			var u user.User
			got, gotErr := u.ListComments(tt.params)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("ListComments() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("ListComments() succeeded unexpectedly")
			}
			// TODO: update the condition below to compare got with tt.want.
			if true {
				t.Errorf("ListComments() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_CreateComment(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		params  user.CreateCommentParams
		want    *discussion.Comment
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// TODO: construct the receiver type.
			var u user.User
			got, gotErr := u.CreateComment(tt.params)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("CreateComment() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("CreateComment() succeeded unexpectedly")
			}
			// TODO: update the condition below to compare got with tt.want.
			if true {
				t.Errorf("CreateComment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_UpdateComment(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		params  user.UpdateCommentParams
		want    *discussion.Comment
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// TODO: construct the receiver type.
			var u user.User
			got, gotErr := u.UpdateComment(tt.params)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("UpdateComment() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("UpdateComment() succeeded unexpectedly")
			}
			// TODO: update the condition below to compare got with tt.want.
			if true {
				t.Errorf("UpdateComment() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_DeleteComment(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		params  user.DeleteCommentParams
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// TODO: construct the receiver type.
			var u user.User
			gotErr := u.DeleteComment(tt.params)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("DeleteComment() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("DeleteComment() succeeded unexpectedly")
			}
		})
	}
}
