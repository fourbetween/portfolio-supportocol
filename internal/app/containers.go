package app

import (
	"database/sql"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/fourbetween/app-supportocol/internal/dialogue"
	dialogueadapter "github.com/fourbetween/app-supportocol/internal/dialogue/infra/adapter"
	dialoguedb "github.com/fourbetween/app-supportocol/internal/dialogue/infra/db"
	"github.com/fourbetween/app-supportocol/internal/identity"
	"github.com/fourbetween/app-supportocol/internal/learning"
	learningadapter "github.com/fourbetween/app-supportocol/internal/learning/infra/adapter"
	"github.com/fourbetween/app-supportocol/internal/workspace"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
)

type Containers struct {
	Dialogue  *dialogue.Container
	Identity  *identity.Container
	Learning  *learning.Container
	Workspace *workspace.Container
}

func NewContainers(dbCon *sql.DB, appConf conf.Service, awscfg aws.Config, jwtSrv jwt.Service) (*Containers, error) {
	dialogueFavSvc := dialoguedb.NewDiscussionFavoritesService(dbCon)

	workspaceCon, err := workspace.NewContainer(dbCon, dialogueFavSvc)
	if err != nil {
		return nil, fmt.Errorf("failed to create workspace api container: %w", err)
	}

	identityCon, err := identity.NewContainer(dbCon, appConf, jwtSrv, workspaceCon.UserCreatedHandler, workspaceCon.UserDeletedHandler)
	if err != nil {
		return nil, fmt.Errorf("failed to create identity api container: %w", err)
	}

	learningPermSv := learningadapter.NewWorkspacePermissionAdapter(workspaceCon.WorkspaceQueryService)
	learningAIUsageSv := learningadapter.NewAIUsageAdapter(workspaceCon.AIUsageService)
	learningCon, err := learning.NewContainer(dbCon, appConf, awscfg, learningPermSv, learningAIUsageSv)
	if err != nil {
		return nil, fmt.Errorf("failed to create learning api container: %w", err)
	}

	dialoguePermSv := dialogueadapter.NewWorkspacePermissionAdapter(workspaceCon.WorkspaceQueryService)
	dialogueCon, err := dialogue.NewContainer(dbCon, dialoguePermSv)
	if err != nil {
		return nil, fmt.Errorf("failed to create dialogue api container: %w", err)
	}

	return &Containers{
		Dialogue:  dialogueCon,
		Identity:  identityCon,
		Learning:  learningCon,
		Workspace: workspaceCon,
	}, nil
}
