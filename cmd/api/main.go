package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/api"
	"github.com/fourbetween/app-supportocol/internal/db"
	auth "github.com/fourbetween/pkg-auth"
	conf "github.com/fourbetween/pkg-conf"
	uow "github.com/fourbetween/pkg-uow"
)

func main() {
	handler, err := makeHandler()
	if err != nil {
		panic(err)
	}

	if err := http.ListenAndServe(":9000", handler); err != nil {
		panic(err)
	}
}

func makeHandler() (http.Handler, error) {
	if err := api.CheckConfig(); err != nil {
		return nil, fmt.Errorf("failed to check config: %w", err)
	}

	dsn, err := conf.GetStringWithStage(context.TODO(), "/app-supportocol/db/dsn")
	if err != nil {
		return nil, fmt.Errorf("failed to get db dsn: %w", err)
	}

	userpoolID, err := conf.GetString(context.TODO(), "/share/cognito/userpool/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get userpool ID: %w", err)
	}

	dbCon, err := db.NewDB(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to db: %w", err)
	}

	authSrv, err := auth.NewCognitoAuth(context.TODO(), auth.CognitoConfig{
		UserPoolID: userpoolID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create auth service: %w", err)
	}

	uowSrv := uow.NewSqlUnitOfWork(dbCon, api.NewContainer)
	return api.NewHttpHandler(uowSrv, authSrv)
}
