package main

import (
	"cdk/container"
	"os"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
)

type CdkStackProps struct {
	awscdk.StackProps
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)
	appName := os.Getenv("PROJECT_NAME")
	for _, stage := range []string{"dev", "demo", "prod"} {
		usContainer := container.NewUsContainer(container.UsContainerProps{
			AppName: appName,
			App:     app,
			StackProps: awscdk.StackProps{
				Env:                   envForUs(),
				CrossRegionReferences: jsii.Bool(true),
			},
			Stage: stage,
		})

		container.NewAppContainer(container.AppContainerProps{
			AppName: appName,
			App:     app,
			StackProps: awscdk.StackProps{
				Env:                   env(),
				CrossRegionReferences: jsii.Bool(true),
			},
			Stage:       stage,
			UsContainer: usContainer,
		})
	}

	app.Synth(nil)
}

func env() *awscdk.Environment {
	return &awscdk.Environment{
		Account: jsii.String(os.Getenv("CDK_DEFAULT_ACCOUNT")),
		Region:  jsii.String(os.Getenv("CDK_DEFAULT_REGION")),
	}
}

func envForUs() *awscdk.Environment {
	return &awscdk.Environment{
		Account: jsii.String(os.Getenv("CDK_DEFAULT_ACCOUNT")),
		Region:  jsii.String("us-east-1"),
	}
}
