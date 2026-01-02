package learning

import (
	"database/sql"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/learning/api"
	"github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/pkg/httperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
)

func NewHTTPHandler(dbCon *sql.DB, appConf conf.Service, jwtSrv jwt.Service) (http.Handler, error) {
	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()

	discussionRepo := db.NewDiscussionRepository(dbCon)
	commentRepo := db.NewCommentRepository(dbCon)
	fac := domain.NewFactory(
		idSrv,
		clockSrv,
	)
	discussionRepo.SetFactory(fac)
	commentRepo.SetFactory(fac)

	server, err := oas.NewServer(
		api.NewHandler(api.HandlerParams{
			CreateDiscussion: usecase.NewCreateDiscussionUsecase(discussionRepo, fac),
			GetDiscussion:    usecase.NewGetDiscussionUsecase(discussionRepo),
			ListDiscussions:  usecase.NewListDiscussionsUsecase(discussionRepo),
			UpdateDiscussion: usecase.NewUpdateDiscussionUsecase(discussionRepo),
			DeleteDiscussion: usecase.NewDeleteDiscussionUsecase(discussionRepo),
			CreateComment:    usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, fac),
			ListComments:     usecase.NewListCommentsUsecase(discussionRepo, commentRepo),
			UpdateComment:    usecase.NewUpdateCommentUsecase(discussionRepo, commentRepo),
			DeleteComment:    usecase.NewDeleteCommentUsecase(discussionRepo, commentRepo),
		}),
		api.NewSecurityHandler(jwtSrv),
		oas.WithErrorHandler(httperr.ErrorHandler),
	)
	if err != nil {
		return nil, err
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := httpctx.WithResponseWriter(r.Context(), w)
		server.ServeHTTP(w, r.WithContext(ctx))
	})

	return handler, nil
}
