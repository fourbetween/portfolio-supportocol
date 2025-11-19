package user_test

import (
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal"
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

	WorkbookRepo *workbook.MockRepository
	ProjectRepo  *project.MockRepository
	RuleRepo     *rule.MockRepository
	IDSrv        *id.MockService
	ClockSrv     *clock.MockService
}

func newContainer(t *testing.T) *container {
	t.Helper()

	ctrl := gomock.NewController(t)

	workbookRepo := workbook.NewMockRepository(ctrl)
	projectRepo := project.NewMockRepository(ctrl)
	ruleRepo := rule.NewMockRepository(ctrl)
	idSrv := id.NewMockService(ctrl)
	clockSrv := clock.NewMockService(ctrl)

	projectFac := project.NewFactory(projectRepo, idSrv)
	ruleFac := rule.NewFactory(ruleRepo, idSrv)
	userFac := user.NewFactory(workbookRepo, projectRepo, ruleRepo, projectFac, ruleFac, clockSrv)

	return &container{
		t:            t,
		UserFac:      userFac,
		ProjectFac:   projectFac,
		RuleFac:      ruleFac,
		WorkbookRepo: workbookRepo,
		ProjectRepo:  projectRepo,
		RuleRepo:     ruleRepo,
		IDSrv:        idSrv,
		ClockSrv:     clockSrv,
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
