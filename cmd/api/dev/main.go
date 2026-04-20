package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/cmd/api"
	"github.com/fourbetween/app-supportocol/cmd/api/middleware"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
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

	handler, err := api.NewHTTPHandler(dbCon, awscfg)
	if err != nil {
		panic(err)
	}

	if err := http.ListenAndServe(":9000", middleware.DevCookie(handler)); err != nil {
		panic(err)
	}
}
