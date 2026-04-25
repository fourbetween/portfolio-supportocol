package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/cmd/api"
	"github.com/fourbetween/app-supportocol/cmd/api/middleware"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	conf "github.com/fourbetween/pkg-conf/conf"
)

func main() {
	dbCon, err := dbcon.NewConnection()
	if err != nil {
		panic(fmt.Errorf("failed to connect to db: %w", err))
	}

	awscfg, err := config.LoadDefaultConfig(
		context.TODO(),
	)
	if err != nil {
		panic(fmt.Errorf("failed to load AWS config: %w", err))
	}

	appConf, err := conf.NewSSMService(env.AppName(), awscfg)
	if err != nil {
		panic(fmt.Errorf("failed to load app config: %w", err))
	}

	handler, err := api.NewHTTPHandler(dbCon, appConf, awscfg)
	if err != nil {
		panic(err)
	}

	appDomain, err := appConf.Get("domain")
	if err != nil {
		panic(fmt.Errorf("failed to get app domain from config: %w", err))
	}

	handler = middleware.CORS("https://" + appDomain)(handler)
	handler = middleware.DevCookie(handler)

	if err := http.ListenAndServe(":9000", handler); err != nil {
		panic(err)
	}
}
