package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/internal/learning"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/fourbetween/pkg-conf/conf"
)

func main() {
	con, err := newContainer()
	if err != nil {
		panic(err)
	}

	if err := exec(con); err != nil {
		panic(err)
	}
}

func exec(con *learning.CommentGenerationContainer) error {
	items, err := con.Queue.Dequeue(1)
	if err != nil {
		return fmt.Errorf("failed to dequeue reservation: %w", err)
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

	awscfg, err := config.LoadDefaultConfig(context.TODO())
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

	return learning.NewCommentGenerationContainer(
		dbCon,
		appConf,
		shareConf,
		awscfg,
	)
}
