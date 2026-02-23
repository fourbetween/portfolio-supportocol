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

	// Favorite Discussions
	AddFavoriteDiscussion    *usecase.AddFavoriteDiscussionUsecase
	RemoveFavoriteDiscussion *usecase.RemoveFavoriteDiscussionUsecase
	ListFavoriteDiscussions  *usecase.ListFavoriteDiscussionsUsecase

	// Subscriptions
	RenewSubscription *usecase.RenewSubscriptionUsecase

	// Hooks
	UserCreatedHandler *usecase.UserCreatedHandler
	UserDeletedHandler *usecase.UserDeletedHandler

	// Services
	WorkspaceQueryService usecase.WorkspaceQueryService
	AIUsageService        usecase.AIUsageService
}

func NewAPIContainer(
	dbCon *sql.DB,
	favSvc domain.DiscussionFavoritesService,
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
	favRepo := db.NewFavoriteDiscussionRepository(dbCon)
	planRepo := db.NewPlanRepository(dbCon)

	workspaceQuerySrv := db.NewWorkspaceQueryService(dbCon)
	aiUsageSrv := db.NewAIUsageService(dbCon, workspaceRepo, idSrv)

	renewSubscriptionUsc := usecase.NewRenewSubscriptionUsecase(workspaceRepo, planRepo, clockSrv, txManager)

	return &APIContainer{
		// Workspaces
		ListMyWorkspaces: usecase.NewListMyWorkspacesUsecase(workspaceQuerySrv, renewSubscriptionUsc, clockSrv),

		// Projects
		CreateProject: usecase.NewCreateProjectUsecase(workspaceRepo, memberRepo, projectRepo, projectFac, txManager),
		GetProject:    usecase.NewGetProjectUsecase(memberRepo, projectRepo),
		ListProjects:  usecase.NewListProjectsUsecase(memberRepo, projectRepo),
		UpdateProject: usecase.NewUpdateProjectUsecase(memberRepo, projectRepo, txManager),
		DeleteProject: usecase.NewDeleteProjectUsecase(memberRepo, projectRepo, txManager),

		// Favorite Discussions
		AddFavoriteDiscussion:    usecase.NewAddFavoriteDiscussionUsecase(workspaceRepo, memberRepo, favRepo, favSvc, clockSrv),
		RemoveFavoriteDiscussion: usecase.NewRemoveFavoriteDiscussionUsecase(memberRepo, favRepo, favSvc),
		ListFavoriteDiscussions:  usecase.NewListFavoriteDiscussionsUsecase(workspaceQuerySrv),

		// Subscriptions
		RenewSubscription: renewSubscriptionUsc,

		// Hooks
		UserCreatedHandler: usecase.NewUserCreatedHandler(workspaceRepo, memberRepo, projectRepo, planRepo, workspaceFac, memberFac, projectFac, txManager),
		UserDeletedHandler: usecase.NewUserDeletedHandler(workspaceRepo, memberRepo, txManager),

		// Services
		WorkspaceQueryService: workspaceQuerySrv,
		AIUsageService:        aiUsageSrv,
	}, nil
}
