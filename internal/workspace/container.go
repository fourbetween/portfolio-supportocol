package workspace

import (
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db"
	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
)

type APIContainer struct {
	// Workspaces
	ListMyWorkspaces *usecase.ListMyWorkspacesUsecase

	// Projects
	CreateProject *usecase.CreateProjectUsecase
	GetProject    *usecase.GetProjectUsecase
	ListProjects  *usecase.ListProjectsUsecase
	UpdateProject *usecase.UpdateProjectUsecase
	DeleteProject *usecase.DeleteProjectUsecase

	// Hooks
	UserCreatedHandler *usecase.UserCreatedHandler

	// Services
	WorkspaceQueryService usecase.WorkspaceQueryService
}

func NewAPIContainer(
	dbCon *sql.DB,
) (*APIContainer, error) {
	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()
	txManager := dbtx.NewManager(dbCon)

	workspaceFac := domain.NewWorkspaceFactory(idSrv, clockSrv)
	memberFac := domain.NewMemberFactory(idSrv, clockSrv)
	projectFac := domain.NewProjectFactory(idSrv, clockSrv)

	workspaceRepo := db.NewWorkspaceRepository(dbCon, workspaceFac)
	memberRepo := db.NewMemberRepository(dbCon, memberFac)
	projectRepo := db.NewProjectRepository(dbCon, projectFac)

	workspaceQuerySrv := db.NewWorkspaceQueryService(dbCon)

	return &APIContainer{
		// Workspaces
		ListMyWorkspaces: usecase.NewListMyWorkspacesUsecase(workspaceQuerySrv),

		// Projects
		CreateProject: usecase.NewCreateProjectUsecase(workspaceRepo, memberRepo, projectRepo, projectFac, txManager),
		GetProject:    usecase.NewGetProjectUsecase(memberRepo, projectRepo),
		ListProjects:  usecase.NewListProjectsUsecase(memberRepo, projectRepo),
		UpdateProject: usecase.NewUpdateProjectUsecase(memberRepo, projectRepo, txManager),
		DeleteProject: usecase.NewDeleteProjectUsecase(memberRepo, projectRepo, txManager),

		// Hooks
		UserCreatedHandler: usecase.NewUserCreatedHandler(workspaceRepo, memberRepo, projectRepo, workspaceFac, memberFac, projectFac, txManager),

		// Services
		WorkspaceQueryService: workspaceQuerySrv,
	}, nil
}
