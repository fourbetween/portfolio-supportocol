package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/fourbetween/app-supportocol/cmd/api"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/fourbetween/pkg-conf/conf"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))

	dbCon, err := dbcon.NewConnection()
	if err != nil {
		panic(fmt.Errorf("failed to connect to db: %w", err))
	}
	dbCon.SetMaxOpenConns(1)
	dbCon.SetMaxIdleConns(1)
	dbCon.SetConnMaxLifetime(3 * time.Minute)

	awscfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithUseDualStackEndpoint(aws.DualStackEndpointStateEnabled),
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

	lambda.Start(httpadapter.NewV2(handler).ProxyWithContext)
}
