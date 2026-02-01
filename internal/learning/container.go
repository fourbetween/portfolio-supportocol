package learning

import (
	"database/sql"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/ai"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/queue"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
	"github.com/fourbetween/pkg-queue/sqs"
)

type APIContainer struct {
	CreateDiscussion         *usecase.CreateDiscussionUsecase
	GetDiscussion            *usecase.GetDiscussionUsecase
	ListDiscussions          *usecase.ListDiscussionsUsecase
	UpdateDiscussion         *usecase.UpdateDiscussionUsecase
	UpdateDiscussionStatus   *usecase.UpdateDiscussionStatusUsecase
	ArchiveDiscussion        *usecase.ArchiveDiscussionUsecase
	UnarchiveDiscussion      *usecase.UnarchiveDiscussionUsecase
	DeleteDiscussion         *usecase.DeleteDiscussionUsecase
	CreateComment            *usecase.CreateCommentUsecase
	ListComments             *usecase.ListCommentsUsecase
	UpdateComment            *usecase.UpdateCommentUsecase
	ArchiveComment           *usecase.ArchiveCommentUsecase
	UnarchiveComment         *usecase.UnarchiveCommentUsecase
	DeleteComment            *usecase.DeleteCommentUsecase
	UpdateCommentStatus      *usecase.UpdateCommentStatusUsecase
	EnqueueCommentGeneration *usecase.EnqueueCommentGenerationUsecase
	ListIssues               *usecase.ListIssuesUsecase
}

func NewAPIContainer(
	dbCon *sql.DB,
	appConf conf.Service,
	jwtSrv jwt.Service,
	awscfg aws.Config,
	permSv domain.PermissionService,
) (*APIContainer, error) {
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
	issueFac := domain.NewIssueFactory(idSrv)
	discussionRepo := db.NewDiscussionRepository(dbCon, discussionFac)
	commentRepo := db.NewCommentRepository(dbCon, commentFac)
	issueRepo := db.NewIssueRepository(dbCon, issueFac)
	discussionQS := db.NewDiscussionQueryService(dbCon)

	queueURL, err := appConf.Get("sqs/comment-generation/url")
	if err != nil {
		return nil, fmt.Errorf("failed to get comment generation queue URL from config: %w", err)
	}
	commentGenerationQueue := queue.NewCommentGenerationQueue(
		sqs.NewDefaultQueue[domain.GenerateCommentParams](queueURL, awscfg),
	)

	return &APIContainer{
		CreateDiscussion:         usecase.NewCreateDiscussionUsecase(discussionRepo, discussionFac, permSv, txManager),
		GetDiscussion:            usecase.NewGetDiscussionUsecase(discussionRepo, permSv),
		ListDiscussions:          usecase.NewListDiscussionsUsecase(discussionQS, permSv),
		UpdateDiscussion:         usecase.NewUpdateDiscussionUsecase(discussionRepo, permSv, txManager),
		UpdateDiscussionStatus:   usecase.NewUpdateDiscussionStatusUsecase(discussionRepo, commentRepo, permSv, txManager),
		ArchiveDiscussion:        usecase.NewArchiveDiscussionUsecase(discussionRepo, permSv, txManager, clockSrv),
		UnarchiveDiscussion:      usecase.NewUnarchiveDiscussionUsecase(discussionRepo, permSv, txManager),
		DeleteDiscussion:         usecase.NewDeleteDiscussionUsecase(discussionRepo, permSv, txManager),
		CreateComment:            usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, commentFac, permSv, clockSrv, txManager),
		ListComments:             usecase.NewListCommentsUsecase(discussionRepo, commentRepo, permSv),
		UpdateComment:            usecase.NewUpdateCommentUsecase(discussionRepo, commentRepo, permSv, txManager),
		ArchiveComment:           usecase.NewArchiveCommentUsecase(discussionRepo, commentRepo, permSv, txManager, clockSrv),
		UnarchiveComment:         usecase.NewUnarchiveCommentUsecase(discussionRepo, commentRepo, permSv, txManager),
		DeleteComment:            usecase.NewDeleteCommentUsecase(discussionRepo, commentRepo, permSv, txManager),
		UpdateCommentStatus:      usecase.NewUpdateCommentStatusUsecase(discussionRepo, commentRepo, permSv, txManager),
		EnqueueCommentGeneration: usecase.NewEnqueueCommentGenerationUsecase(discussionRepo, permSv, commentGenerationQueue),
		ListIssues:               usecase.NewListIssuesUsecase(issueRepo),
	}, nil
}

type CommentGenerationContainer struct {
	GenerateComment *usecase.GenerateCommentUsecase
	Queue           sqs.Queue[domain.GenerateCommentParams]
}

func NewCommentGenerationContainer(
	dbCon *sql.DB,
	appConf conf.Service,
	shareConf conf.Service,
	awscfg aws.Config,
	permSv domain.PermissionService,
) (*CommentGenerationContainer, error) {
	geminiAPIKey, err := shareConf.Get("google/gemini/apikey")
	if err != nil {
		return nil, fmt.Errorf("failed to get Gemini API key from config: %w", err)
	}

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

	generator, err := ai.NewCommentGenerator(
		discussionRepo,
		commentRepo,
		commentFac,
		geminiAPIKey,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment generator: %w", err)
	}

	queueURL, err := appConf.Get("sqs/comment-generation/url")
	if err != nil {
		return nil, fmt.Errorf("failed to get comment generation queue URL from config: %w", err)
	}

	return &CommentGenerationContainer{
		GenerateComment: usecase.NewGenerateCommentUsecase(discussionRepo, commentRepo, generator, permSv, clockSrv, txManager),
		Queue:           sqs.NewDefaultQueue[domain.GenerateCommentParams](queueURL, awscfg),
	}, nil
}
