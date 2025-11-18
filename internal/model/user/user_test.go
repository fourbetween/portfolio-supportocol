package user_test

import (
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/model/project"
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

	WorkbookRepo *workbook.MockRepository
	ProjectRepo  *project.MockRepository
	IDSrv        *id.MockService
	ClockSrv     *clock.MockService
}

func newContainer(t *testing.T) *container {
	t.Helper()

	ctrl := gomock.NewController(t)

	workbookRepo := workbook.NewMockRepository(ctrl)
	projectRepo := project.NewMockRepository(ctrl)
	idSrv := id.NewMockService(ctrl)
	clockSrv := clock.NewMockService(ctrl)

	projectFac := project.NewFactory(projectRepo, idSrv)
	userFac := user.NewFactory(workbookRepo, projectRepo, projectFac, clockSrv)

	return &container{
		t:            t,
		UserFac:      userFac,
		ProjectFac:   projectFac,
		WorkbookRepo: workbookRepo,
		ProjectRepo:  projectRepo,
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
