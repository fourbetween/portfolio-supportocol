package main

import (
	"cdk/container"
	"context"
	"os"
	"slices"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/jsii-runtime-go"
	conf "github.com/fourbetween/pkg-conf"
)

type CdkStackProps struct {
	awscdk.StackProps
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)
	appName := os.Getenv("APP_NAME")
	stage := os.Getenv("STAGE")
	if !slices.Contains([]string{"dev", "demo", "prod"}, stage) {
		panic("Invalid STAGE value")
	}

	awscfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(err)
	}

	shareConf, err := conf.NewSSMService("share", awscfg)
	if err != nil {
		panic(err)
	}

	certContainer := container.NewCertContainer(container.CertContainerProps{
		AppName: appName,
		App:     app,
		StackProps: awscdk.StackProps{
			Env:                   awsEnvForCert(),
			CrossRegionReferences: jsii.Bool(true),
		},
		Stage: stage,
	})

	container.NewAppContainer(container.AppContainerProps{
		AppName: appName,
		App:     app,
		StackProps: awscdk.StackProps{
			Env:                   awsEnv(),
			CrossRegionReferences: jsii.Bool(true),
		},
		Stage:         stage,
		CertContainer: certContainer,
		ShareConf:     shareConf,
	})

	app.Synth(nil)
}

func awsEnv() *awscdk.Environment {
	return &awscdk.Environment{
		Account: jsii.String(os.Getenv("CDK_DEFAULT_ACCOUNT")),
		Region:  jsii.String(os.Getenv("CDK_DEFAULT_REGION")),
	}
}

func awsEnvForCert() *awscdk.Environment {
	return &awscdk.Environment{
		Account: jsii.String(os.Getenv("CDK_DEFAULT_ACCOUNT")),
		Region:  jsii.String("us-east-1"),
	}
}
