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
	if stage != "prod" {
		base = stage + "." + base
	}
	if stage == "prod" && strings.HasPrefix(app, "app-") {
		app = strings.TrimPrefix(app, "app-")
	}
	return fmt.Sprintf("%s.%s", app, base)
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
