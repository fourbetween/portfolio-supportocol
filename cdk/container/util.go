package container

import (
	"fmt"
	"strings"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsssm"
	"github.com/aws/jsii-runtime-go"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func GetRootDomain() string {
	return "hick-r.com"
}

func GetDomain(app, stage string) string {
	base := GetRootDomain()
	if stage != "prod" {
		base = stage + "." + base
	}
	return fmt.Sprintf("%s.%s", app, base)
}

func ConvToPascalCase(template string, ss ...string) string {
	fixed := make([]any, len(ss))
	caser := cases.Title(language.English)
	for i, s := range ss {
		parts := strings.Split(s, "-")
		var pascalParts []string
		for _, part := range parts {
			if part != "" {
				pascalParts = append(pascalParts, caser.String(part))
			}
		}
		fixed[i] = strings.Join(pascalParts, "")
	}
	return fmt.Sprintf(template, fixed...)
}

func StackName(app, stage string) string {
	elems := []string{
		app,
		stage,
		"Stack",
	}
	return ConvToPascalCase("%s%s%s", elems...)
}

func SetParam(stack awscdk.Stack, app, stage, key, value string) {
	id := "Param" + strings.ReplaceAll(key, "/", "")
	name := "/" + app + "/" + strings.Trim(key, "/") + "/" + stage
	awsssm.NewStringParameter(
		stack,
		jsii.String(id),
		&awsssm.StringParameterProps{
			ParameterName: jsii.String(name),
			StringValue:   jsii.String(value),
		},
	)
}
