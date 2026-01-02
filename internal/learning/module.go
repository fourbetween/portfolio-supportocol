package learning

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/learning/api"
	"github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/ai"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/pkg/httperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
)

func NewHTTPHandler(
	dbCon *sql.DB,
	appConf conf.Service,
	shareConf conf.Service,
	jwtSrv jwt.Service,
) (http.Handler, error) {
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

	server, err := oas.NewServer(
		api.NewHandler(api.HandlerParams{
			CreateDiscussion: usecase.NewCreateDiscussionUsecase(discussionRepo, discussionFac),
			GetDiscussion:    usecase.NewGetDiscussionUsecase(discussionRepo),
			ListDiscussions:  usecase.NewListDiscussionsUsecase(discussionRepo),
			UpdateDiscussion: usecase.NewUpdateDiscussionUsecase(discussionRepo),
			DeleteDiscussion: usecase.NewDeleteDiscussionUsecase(discussionRepo),
			CreateComment:    usecase.NewCreateCommentUsecase(discussionRepo, commentRepo, commentFac),
			ListComments:     usecase.NewListCommentsUsecase(discussionRepo, commentRepo),
			UpdateComment:    usecase.NewUpdateCommentUsecase(discussionRepo, commentRepo),
			DeleteComment:    usecase.NewDeleteCommentUsecase(discussionRepo, commentRepo),
			GenerateComment:  usecase.NewGenerateCommentUsecase(discussionRepo, commentRepo, generator),
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
