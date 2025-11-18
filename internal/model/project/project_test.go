package project_test

import (
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/service/id"
	"github.com/google/go-cmp/cmp"
	"go.uber.org/mock/gomock"
)

type container struct {
	ProjectFac  *project.Factory
	ProjectRepo *project.MockRepository
	IDSrv       *id.MockService
}

func newContainer(t *testing.T) *container {
	t.Helper()
	ctrl := gomock.NewController(t)
	projectRepo := project.NewMockRepository(ctrl)
	idSrv := id.NewMockService(ctrl)
	projectFac := project.NewFactory(projectRepo, idSrv)
	return &container{
		ProjectFac:  projectFac,
		ProjectRepo: projectRepo,
		IDSrv:       idSrv,
	}
}

func TestProject_UpdateName(t *testing.T) {
	tests := []struct {
		name    string
		newName string
		want    string
	}{
		{
			name:    "名前を更新できること",
			newName: "updated-name",
			want:    "updated-name",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			p := con.ProjectFac.BuildProject(project.BuildProjectParams{
				ID: "test-id",
				NewProjectParams: project.NewProjectParams{
					Name:      "test-name",
					CreatedBy: "test-user",
					CreatedAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
				},
			})
			p.UpdateName(tt.newName)
			got := p.Name()
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("Name() mismatch (-want +got):\n%s", diff)
			}
		})
	}
}
