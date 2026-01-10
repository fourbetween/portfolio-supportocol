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

	discussionRepo := db.NewDiscussionRepository(dbCon)
	commentRepo := db.NewCommentRepository(dbCon)
	discussionFac := domain.NewDiscussionFactory(
		idSrv,
		clockSrv,
	)
	commentFac := domain.NewCommentFactory(
		idSrv,
		clockSrv,
	)
	discussionRepo.SetFactory(discussionFac)
	commentRepo.SetFactory(commentFac)

	queueURL, err := appConf.Get("sqs/comment-generation/url")
	if err != nil {
		return nil, fmt.Errorf("failed to get comment generation queue URL from config: %w", err)
	}
	commentGenerationQueue := queue.NewCommentGenerationQueue(
		sqs.NewDefaultQueue[domain.GenerateCommentParams](queueURL, awscfg),
	)

	return &APIContainer{
		CreateDiscussion:         usecase.NewCreateDiscussionUsecase(discussionRepo, discussionFac),
		GetDiscussion:            usecase.NewGetDiscussionUsecase(discussionRepo),
		ListDiscussions:          usecase.NewListDiscussionsUsecase(discussionRepo),
		UpdateDiscussion:         usecase.NewUpdateDiscussionUsecase(discussionRepo),
		DeleteDiscussion:         usecase.NewDeleteDiscussionUsecase(discussionRepo),
		CreateComment:            usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, commentFac),
		ListComments:             usecase.NewListCommentsUsecase(discussionRepo, commentRepo),
		UpdateComment:            usecase.NewUpdateCommentUsecase(discussionRepo, commentRepo),
		DeleteComment:            usecase.NewDeleteCommentUsecase(discussionRepo, commentRepo),
		UpdateCommentStatus:      usecase.NewUpdateCommentStatusUsecase(discussionRepo, commentRepo),
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

	discussionRepo := db.NewDiscussionRepository(dbCon)
	commentRepo := db.NewCommentRepository(dbCon)
	discussionFac := domain.NewDiscussionFactory(
		idSrv,
		clockSrv,
	)
	commentFac := domain.NewCommentFactory(
		idSrv,
		clockSrv,
	)
	discussionRepo.SetFactory(discussionFac)
	commentRepo.SetFactory(commentFac)

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
		GenerateComment: usecase.NewGenerateCommentUsecase(discussionRepo, commentRepo, generator),
		Queue:           sqs.NewDefaultQueue[domain.GenerateCommentParams](queueURL, awscfg),
	}, nil
}
