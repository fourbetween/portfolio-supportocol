package handler

import (
	"database/sql"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/fourbetween/pkg-conf/conf"
)

type container struct {
	discussionRepo domain.Repository
}

func newContainer(dbCon *sql.DB, appConf conf.Service) (*container, error) {
	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()

	discussionRepo := db.NewDiscussionRepository(dbCon)
	discussionFac := domain.NewFactory(
		discussionRepo,
		idSrv,
		clockSrv,
	)
	discussionRepo.SetFactory(discussionFac)

	return &container{
		discussionRepo: discussionRepo,
	}, nil
}
