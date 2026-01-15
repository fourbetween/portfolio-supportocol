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

	discussionRepo := db.NewDiscussionRepository(dbCon)
	commentRepo := db.NewCommentRepository(dbCon)
	discussionFac := domain.NewDiscussionFactory()
	commentFac := domain.NewCommentFactory(
		idSrv,
		clockSrv,
	)
	discussionRepo.SetFactory(discussionFac)
	commentRepo.SetFactory(commentFac)

	return &APIContainer{
		GetDiscussion:   usecase.NewGetDiscussionUsecase(discussionRepo),
		ListDiscussions: usecase.NewListDiscussionsUsecase(discussionRepo),
		ListComments:    usecase.NewListCommentsUsecase(discussionRepo, commentRepo),
		CreateComment:   usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, commentFac, txManager),
	}, nil
}
