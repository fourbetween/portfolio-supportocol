package main

import (
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/fourbetween/app-supportocol/cmd/api"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
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

	handler, err := api.NewHTTPHandler(dbCon)
	if err != nil {
		panic(err)
	}

	lambda.Start(httpadapter.NewV2(handler).ProxyWithContext)
}
