package user_test

import (
	"testing"
	"time"

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

	userFac := user.NewFactory(workbookRepo, projectRepo, idSrv, clockSrv)
	projectFac := project.NewFactory(projectRepo, idSrv)

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

func TestUser_CreateProject(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		params user.CreateProjectParams
		setup  func(*container)
		verify func(*testing.T, project.Project, error)
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
			verify: func(t *testing.T, got project.Project, err error) {
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
