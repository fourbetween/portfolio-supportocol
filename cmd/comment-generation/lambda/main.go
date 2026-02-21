package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/internal/learning"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/adapter"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	wsdomain "github.com/fourbetween/app-supportocol/internal/workspace/domain"
	wsdb "github.com/fourbetween/app-supportocol/internal/workspace/infra/db"
	"github.com/fourbetween/pkg-conf/conf"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))

	con, err := newContainer()
	if err != nil {
		panic(err)
	}

	lambda.Start(func(ctx context.Context, sqsEvent events.SQSEvent) (events.SQSEventResponse, error) {
		return exec(ctx, sqsEvent, con)
	})
}

func exec(ctx context.Context, sqsEvent events.SQSEvent, con *learning.CommentGenerationContainer) (events.SQSEventResponse, error) {
	items, err := con.Queue.DequeueFromEvent(sqsEvent)
	if err != nil {
		return events.SQSEventResponse{}, fmt.Errorf("failed to dequeue reservation: %w", err)
	}

	var batchItemFailures []events.SQSBatchItemFailure
	for _, item := range items {
		_, err := con.GenerateComment.Execute(ctx, usecase.GenerateCommentInput(*item.Item))
		if err != nil {
			slog.Error("failed to generate comment", "error", err, "item", *item.Item)
			batchItemFailures = append(batchItemFailures, events.SQSBatchItemFailure{
				ItemIdentifier: item.MessageID,
			})
		}
	}

	return events.SQSEventResponse{
		BatchItemFailures: batchItemFailures,
	}, nil
}

func newContainer() (*learning.CommentGenerationContainer, error) {
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
		return nil, fmt.Errorf("failed to load aws config for ses: %w", err)
	}

	appConf, err := conf.NewSSMService(env.AppName(), awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to load app config: %w", err)
	}

	shareConf, err := conf.NewSSMService("share", awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to load share config: %w", err)
	}

	wsQueryService := wsdb.NewWorkspaceQueryService(dbCon)
	permSv := adapter.NewWorkspacePermissionAdapter(wsQueryService)

	wsFac := wsdomain.NewWorkspaceFactory(id.NewUUIDService(), clock.NewRealService())
	wsRepo := wsdb.NewWorkspaceRepository(dbCon, wsFac)
	aiUsageSv := adapter.NewAIUsageAdapter(wsdb.NewAIUsageService(dbCon, wsRepo, id.NewUUIDService()))

	projectFac := wsdomain.NewProjectFactory(id.NewUUIDService(), clock.NewRealService())
	projectRepo := wsdb.NewProjectRepository(dbCon, projectFac)
	projectPremiseProv := adapter.NewProjectPremiseAdapter(projectRepo)

	return learning.NewCommentGenerationContainer(
		dbCon,
		appConf,
		shareConf,
		awscfg,
		permSv,
		aiUsageSv,
		projectPremiseProv,
	)
}
