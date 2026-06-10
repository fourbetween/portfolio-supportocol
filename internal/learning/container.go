package learning

import (
	"database/sql"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/ai"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/logging"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/web"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/fourbetween/pkg-conf/conf"
)

type Container struct {
	CreateDiscussion              *usecase.CreateDiscussionUsecase
	GetDiscussion                 *usecase.GetDiscussionUsecase
	ListDiscussions               *usecase.ListDiscussionsUsecase
	UpdateDiscussion              *usecase.UpdateDiscussionUsecase
	UpdateDiscussionStatus        *usecase.UpdateDiscussionStatusUsecase
	ArchiveDiscussion             *usecase.ArchiveDiscussionUsecase
	UnarchiveDiscussion           *usecase.UnarchiveDiscussionUsecase
	DeleteDiscussion              *usecase.DeleteDiscussionUsecase
	CreateComment                 *usecase.CreateCommentUsecase
	ListComments                  *usecase.ListCommentsUsecase
	UpdateComment                 *usecase.UpdateCommentUsecase
	MoveComment                   *usecase.MoveCommentUsecase
	ArchiveComment                *usecase.ArchiveCommentUsecase
	UnarchiveComment              *usecase.UnarchiveCommentUsecase
	DeleteComment                 *usecase.DeleteCommentUsecase
	LiftComment                   *usecase.LiftCommentUsecase
	UpdateCommentStatus           *usecase.UpdateCommentStatusUsecase
	RemoveCommentIssue            *usecase.RemoveCommentIssueUsecase
	ReplaceComments               *usecase.ReplaceCommentsUsecase
	RenameCommentType             *usecase.RenameCommentTypeUsecase
	GenerateComment               *usecase.GenerateChildCommentsUsecase
	GenerateDiscussion            *usecase.GenerateDiscussionUsecase
	GenerateCommentsForDiscussion *usecase.GenerateCommentsForDiscussionUsecase
}

func NewContainer(
	dbCon *sql.DB,
	appConf conf.Service,
	shareConf conf.Service,
	awscfg aws.Config,
	permSv domain.PermissionService,
	aiUsageSv domain.AIUsageService,
	projectPremiseProv domain.ProjectPremiseProvider,
) (*Container, error) {
	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()
	txManager := dbtx.NewManager(dbCon)

	discussionFac := domain.NewDiscussionFactory(
		idSrv,
		clockSrv,
	)
	commentFac := domain.NewCommentFactory(
		idSrv,
		clockSrv,
	)
	discussionRepo := db.NewDiscussionRepository(dbCon, discussionFac)
	commentRepo := db.NewCommentRepository(dbCon, commentFac)
	discussionQS := db.NewDiscussionQueryService(dbCon)

	geminiAPIKey, err := shareConf.Get("google/gemini/apikey")
	if err != nil {
		return nil, fmt.Errorf("failed to get Gemini API key from config: %w", err)
	}

	fetchURL, err := shareConf.Get("lambda/fetch-html/url")
	if err != nil {
		return nil, fmt.Errorf("failed to get fetch-html lambda URL from config: %w", err)
	}

	generator, err := ai.NewCommentGenerator(
		discussionRepo,
		commentRepo,
		projectPremiseProv,
		web.NewURLContentFetcher(fetchURL),
		commentFac,
		clockSrv,
		geminiAPIKey,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment generator: %w", err)
	}

	auditSv := logging.NewSlogAuditService()

	return &Container{
		CreateDiscussion:              usecase.NewCreateDiscussionUsecase(discussionRepo, discussionFac, permSv, txManager, auditSv),
		GetDiscussion:                 usecase.NewGetDiscussionUsecase(discussionRepo, permSv),
		ListDiscussions:               usecase.NewListDiscussionsUsecase(discussionQS, permSv),
		UpdateDiscussion:              usecase.NewUpdateDiscussionUsecase(discussionRepo, permSv, txManager, auditSv),
		UpdateDiscussionStatus:        usecase.NewUpdateDiscussionStatusUsecase(discussionRepo, commentRepo, permSv, txManager),
		ArchiveDiscussion:             usecase.NewArchiveDiscussionUsecase(discussionRepo, permSv, txManager, clockSrv),
		UnarchiveDiscussion:           usecase.NewUnarchiveDiscussionUsecase(discussionRepo, permSv, txManager),
		DeleteDiscussion:              usecase.NewDeleteDiscussionUsecase(discussionRepo, permSv, txManager),
		CreateComment:                 usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, commentFac, permSv, clockSrv, txManager, auditSv),
		ListComments:                  usecase.NewListCommentsUsecase(discussionRepo, commentRepo, permSv),
		UpdateComment:                 usecase.NewUpdateCommentUsecase(discussionRepo, commentRepo, permSv, txManager, auditSv),
		MoveComment:                   usecase.NewMoveCommentUsecase(discussionRepo, commentRepo, permSv, txManager, auditSv),
		ArchiveComment:                usecase.NewArchiveCommentUsecase(discussionRepo, commentRepo, permSv, txManager, clockSrv),
		UnarchiveComment:              usecase.NewUnarchiveCommentUsecase(discussionRepo, commentRepo, permSv, txManager),
		DeleteComment:                 usecase.NewDeleteCommentUsecase(discussionRepo, commentRepo, permSv, txManager),
		LiftComment:                   usecase.NewLiftCommentUsecase(discussionRepo, commentRepo, permSv, txManager),
		UpdateCommentStatus:           usecase.NewUpdateCommentStatusUsecase(discussionRepo, commentRepo, permSv, clockSrv, txManager),
		RemoveCommentIssue:            usecase.NewRemoveCommentIssueUsecase(discussionRepo, commentRepo, permSv, txManager),
		ReplaceComments:               usecase.NewReplaceCommentsUsecase(discussionRepo, commentRepo, commentFac, permSv, clockSrv, txManager, auditSv),
		RenameCommentType:             usecase.NewRenameCommentTypeUsecase(discussionRepo, commentRepo, permSv, txManager, auditSv),
		GenerateComment:               usecase.NewGenerateChildCommentsUsecase(discussionRepo, commentRepo, generator, permSv, aiUsageSv, clockSrv, txManager),
		GenerateDiscussion:            usecase.NewGenerateDiscussionUsecase(discussionRepo, commentRepo, discussionFac, generator, permSv, aiUsageSv, clockSrv, txManager, auditSv),
		GenerateCommentsForDiscussion: usecase.NewGenerateCommentsForDiscussionUsecase(discussionRepo, commentRepo, generator, permSv, aiUsageSv, clockSrv, txManager),
	}, nil
}
