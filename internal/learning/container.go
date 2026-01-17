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
	DeleteComment            *usecase.DeleteCommentUsecase
	UpdateCommentStatus      *usecase.UpdateCommentStatusUsecase
	EnqueueCommentGeneration *usecase.EnqueueCommentGenerationUsecase
}

func NewAPIContainer(
	dbCon *sql.DB,
	appConf conf.Service,
	jwtSrv jwt.Service,
	awscfg aws.Config,
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
	discussionRepo := db.NewDiscussionRepository(dbCon, discussionFac)
	commentRepo := db.NewCommentRepository(dbCon, commentFac)
	discussionQS := db.NewDiscussionQueryService(dbCon)

	queueURL, err := appConf.Get("sqs/comment-generation/url")
	if err != nil {
		return nil, fmt.Errorf("failed to get comment generation queue URL from config: %w", err)
	}
	commentGenerationQueue := queue.NewCommentGenerationQueue(
		sqs.NewDefaultQueue[domain.GenerateCommentParams](queueURL, awscfg),
	)

	return &APIContainer{
		CreateDiscussion:         usecase.NewCreateDiscussionUsecase(discussionRepo, discussionFac, txManager),
		GetDiscussion:            usecase.NewGetDiscussionUsecase(discussionRepo),
		ListDiscussions:          usecase.NewListDiscussionsUsecase(discussionQS),
		UpdateDiscussion:         usecase.NewUpdateDiscussionUsecase(discussionRepo, txManager),
		UpdateDiscussionStatus:   usecase.NewUpdateDiscussionStatusUsecase(discussionRepo, txManager),
		ArchiveDiscussion:        usecase.NewArchiveDiscussionUsecase(discussionRepo, txManager, clockSrv),
		UnarchiveDiscussion:      usecase.NewUnarchiveDiscussionUsecase(discussionRepo, txManager),
		DeleteDiscussion:         usecase.NewDeleteDiscussionUsecase(discussionRepo, txManager),
		CreateComment:            usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, commentFac, clockSrv, txManager),
		ListComments:             usecase.NewListCommentsUsecase(discussionRepo, commentRepo),
		UpdateComment:            usecase.NewUpdateCommentUsecase(discussionRepo, commentRepo, txManager),
		DeleteComment:            usecase.NewDeleteCommentUsecase(discussionRepo, commentRepo, txManager),
		UpdateCommentStatus:      usecase.NewUpdateCommentStatusUsecase(discussionRepo, commentRepo, txManager),
		EnqueueCommentGeneration: usecase.NewEnqueueCommentGenerationUsecase(discussionRepo, commentGenerationQueue),
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
		GenerateComment: usecase.NewGenerateCommentUsecase(discussionRepo, commentRepo, generator, clockSrv, txManager),
		Queue:           sqs.NewDefaultQueue[domain.GenerateCommentParams](queueURL, awscfg),
	}, nil
}
