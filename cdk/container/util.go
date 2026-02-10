package container

import (
	"fmt"
	"strings"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsssm"
	"github.com/aws/jsii-runtime-go"
)

func getRootDomain(stage string) string {
	if stage == "prod" {
		return "supportocol.com"
	}
	return "hick-r.com"
}

func getDomain(app, stage string) string {
	base := getRootDomain(stage)
	if stage == "prod" {
		return base
	}
	return fmt.Sprintf("%s.%s.%s", app, stage, base)
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
