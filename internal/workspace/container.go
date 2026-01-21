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
	CreateWorkspace *usecase.CreateWorkspaceUsecase
	GetWorkspace    *usecase.GetWorkspaceUsecase
	ListWorkspaces  *usecase.ListWorkspacesUsecase
	UpdateWorkspace *usecase.UpdateWorkspaceUsecase
	DeleteWorkspace *usecase.DeleteWorkspaceUsecase

	// Members
	ListMembers  *usecase.ListMembersUsecase
	AddMember    *usecase.AddMemberUsecase
	UpdateMember *usecase.UpdateMemberUsecase
	RemoveMember *usecase.RemoveMemberUsecase

	// Projects
	CreateProject *usecase.CreateProjectUsecase
	GetProject    *usecase.GetProjectUsecase
	ListProjects  *usecase.ListProjectsUsecase
	UpdateProject *usecase.UpdateProjectUsecase
	DeleteProject *usecase.DeleteProjectUsecase
}

func NewAPIContainer(
	dbCon *sql.DB,
) (*APIContainer, error) {
	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()
	txManager := dbtx.NewManager(dbCon)

	workspaceFac := domain.NewWorkspaceFactory(idSrv, clockSrv)
	memberFac := domain.NewMemberFactory(clockSrv)
	projectFac := domain.NewProjectFactory(idSrv, clockSrv)

	workspaceRepo := db.NewWorkspaceRepository(dbCon, workspaceFac)
	memberRepo := db.NewMemberRepository(dbCon, memberFac)
	projectRepo := db.NewProjectRepository(dbCon, projectFac)

	return &APIContainer{
		// Workspaces
		CreateWorkspace: usecase.NewCreateWorkspaceUsecase(workspaceRepo, memberRepo, workspaceFac, memberFac, txManager),
		GetWorkspace:    usecase.NewGetWorkspaceUsecase(workspaceRepo, memberRepo),
		ListWorkspaces:  usecase.NewListWorkspacesUsecase(workspaceRepo),
		UpdateWorkspace: usecase.NewUpdateWorkspaceUsecase(workspaceRepo, memberRepo, txManager),
		DeleteWorkspace: usecase.NewDeleteWorkspaceUsecase(workspaceRepo, memberRepo, txManager),

		// Members
		ListMembers:  usecase.NewListMembersUsecase(memberRepo),
		AddMember:    usecase.NewAddMemberUsecase(workspaceRepo, memberRepo, memberFac, txManager),
		UpdateMember: usecase.NewUpdateMemberUsecase(memberRepo, txManager),
		RemoveMember: usecase.NewRemoveMemberUsecase(memberRepo, txManager),

		// Projects
		CreateProject: usecase.NewCreateProjectUsecase(memberRepo, projectRepo, projectFac, txManager),
		GetProject:    usecase.NewGetProjectUsecase(memberRepo, projectRepo),
		ListProjects:  usecase.NewListProjectsUsecase(memberRepo, projectRepo),
		UpdateProject: usecase.NewUpdateProjectUsecase(memberRepo, projectRepo, txManager),
		DeleteProject: usecase.NewDeleteProjectUsecase(memberRepo, projectRepo, txManager),
	}, nil
}
