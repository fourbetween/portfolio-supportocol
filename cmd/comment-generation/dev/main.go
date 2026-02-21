package main

import (
	"context"
	"fmt"
	"time"

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
	con, err := newContainer()
	if err != nil {
		panic(err)
	}

	for {
		fmt.Printf("[%s] executing...\n", time.Now().Format(time.RFC3339))
		if err := exec(con); err != nil {
			fmt.Printf("[%s] error: %v\n", time.Now().Format(time.RFC3339), err)
		}
	}
}

func exec(con *learning.CommentGenerationContainer) error {
	items, err := con.Queue.Dequeue(10)
	if err != nil {
		return fmt.Errorf("failed to dequeue reservation: %w", err)
	}

	if len(items) > 0 {
		fmt.Printf("dequeued %d items\n", len(items))
	}

	for _, item := range items {
		_, err := con.GenerateComment.Execute(context.TODO(), usecase.GenerateCommentInput(*item.Item))
		if err != nil {
			return fmt.Errorf("failed to execute comment generation usecase: %w", err)
		}

		if err := con.Queue.DeleteMessages([]string{item.ReceiptHandle}); err != nil {
			return fmt.Errorf("failed to complete queue item: %w", err)
		}
	}
	return nil
}

func newContainer() (*learning.CommentGenerationContainer, error) {
	dbCon, err := dbcon.NewConnection()
	if err != nil {
		panic(fmt.Errorf("failed to connect to db: %w", err))
	}

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

	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()

	wsFac := wsdomain.NewWorkspaceFactory(idSrv, clockSrv)
	wsRepo := wsdb.NewWorkspaceRepository(dbCon, wsFac)
	aiUsageSv := adapter.NewAIUsageAdapter(wsdb.NewAIUsageService(dbCon, wsRepo, idSrv))

	projectFac := wsdomain.NewProjectFactory(idSrv, clockSrv)
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
