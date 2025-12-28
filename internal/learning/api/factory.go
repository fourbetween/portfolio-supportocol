package handler

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/pkg/httperr"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-conf/conf"
)

func NewHTTPHandler(dbCon *sql.DB, appConf conf.Service, jwtSrv jwt.Service) (http.Handler, error) {
	container, err := newContainer(dbCon, appConf)
	if err != nil {
		return nil, fmt.Errorf("failed to create container: %w", err)
	}

	app := &appHandler{
		con:    container,
		jwtSrv: jwtSrv,
	}

	server, err := oas.NewServer(
		app,
		NewSecurityHandler(jwtSrv),
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
