package dialogue

import (
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/dialogue/infra/db"
	"github.com/fourbetween/app-supportocol/internal/dialogue/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type APIContainer struct {
	GetDiscussion   *usecase.GetDiscussionUsecase
	ListDiscussions *usecase.ListDiscussionsUsecase
	ListComments    *usecase.ListCommentsUsecase
	CreateComment   *usecase.CreateCommentUsecase
}

func NewAPIContainer(
	dbCon *sql.DB,
) (*APIContainer, error) {
	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()
	txManager := dbtx.NewManager(dbCon)

	discussionFac := domain.NewDiscussionFactory()
	commentFac := domain.NewCommentFactory(
		idSrv,
		clockSrv,
	)
	discussionRepo := db.NewDiscussionRepository(dbCon, discussionFac)
	discussionQS := db.NewDiscussionQueryService(dbCon)
	commentRepo := db.NewCommentRepository(dbCon, commentFac)

	return &APIContainer{
		GetDiscussion:   usecase.NewGetDiscussionUsecase(discussionRepo),
		ListDiscussions: usecase.NewListDiscussionsUsecase(discussionQS),
		ListComments:    usecase.NewListCommentsUsecase(discussionRepo, commentRepo),
		CreateComment:   usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, commentFac, clockSrv, txManager),
	}, nil
}
