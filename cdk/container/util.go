package container

import (
	"fmt"
	"strings"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsssm"
	"github.com/aws/jsii-runtime-go"
)

func getRootDomain() string {
	return "hick-r.com"
}

func getDomain(app, stage string) string {
	base := getRootDomain()
	app = strings.TrimPrefix(app, "app-")
	if stage == "prod" {
		return fmt.Sprintf("%s.%s", app, base)
	}
	return fmt.Sprintf("%s.%s.%s", app, stage, base)
}

func getAPIDomain(appName, stage string) string {
	return "api." + getDomain(appName, stage)
}

func setParam(stack awscdk.Stack, app, key, value string) {
	id := "Param" + strings.ReplaceAll(key, "/", "")
	name := "/" + app + "/" + strings.Trim(key, "/")
	awsssm.NewStringParameter(
		stack,
		jsii.String(id),
		&awsssm.StringParameterProps{
			ParameterName: jsii.String(name),
			StringValue:   jsii.String(value),
		},
	)
}
