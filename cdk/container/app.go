package container

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigatewayv2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigatewayv2integrations"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfront"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfrontorigins"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscognito"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambdaeventsources"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsroute53"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsroute53targets"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3assets"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3deployment"
	"github.com/aws/jsii-runtime-go"

	conf "github.com/fourbetween/pkg-conf"
)

type (
	AppContainer struct {
		appName     string
		stack       awscdk.Stack
		stage       string
		usContainer *UsContainer

		logGroup       awslogs.ILogGroup
		userPool       awscognito.IUserPool
		viewBucket     awss3.Bucket
		userPoolClient awscognito.UserPoolClient
		apiFunc        awslambda.Function
		mainApi        awsapigatewayv2.HttpApi
		cdn            awscloudfront.Distribution
		dns            awsroute53.IHostedZone
		mainRecord     awsroute53.ARecord
	}

	AppContainerProps struct {
		AppName     string
		App         awscdk.App
		StackProps  awscdk.StackProps
		Stage       string
		UsContainer *UsContainer
	}
)

func NewAppContainer(p AppContainerProps) *AppContainer {
	c := &AppContainer{
		appName: p.AppName,
		stack: awscdk.NewStack(
			p.App,
			jsii.String(StackName(p.AppName, p.Stage)),
			&p.StackProps,
		),
		stage:       p.Stage,
		usContainer: p.UsContainer,
	}
	c.setParam("domain", c.domain())

	c.buildLogGroup()
	c.buildUserPool()

	if c.stage != "dev" {
		c.buildViewBucket()
		c.buildApiFunction()
		c.buildMainAPI()
		c.buildCDN()
		c.buildViewCacheClearFunction()
	}

	c.buildAuth()
	c.buildDNS()
	c.buildMainRecord()

	return c
}

func (c *AppContainer) buildLogGroup() {
	loggroupArn, _ := conf.GetString(context.TODO(), "/share/loggroup/arn")
	c.logGroup = awslogs.LogGroup_FromLogGroupArn(c.stack, jsii.String("ShareLogGroup"), jsii.String(loggroupArn))
}

func (c *AppContainer) buildUserPool() {
	userPoolId, _ := conf.GetString(context.TODO(), "/share/cognito/userpool/id")
	c.userPool = awscognito.UserPool_FromUserPoolId(c.stack, jsii.String("ShareUserPool"), jsii.String(userPoolId))
}

func (c *AppContainer) buildCDN() {
	cdn := awscloudfront.NewDistribution(
		c.stack,
		jsii.String("Cdn"),
		&awscloudfront.DistributionProps{
			PriceClass:        awscloudfront.PriceClass_PRICE_CLASS_200,
			Certificate:       c.usContainer.Cert,
			DefaultRootObject: jsii.String("index.html"),
			DefaultBehavior: &awscloudfront.BehaviorOptions{
				Origin:               awscloudfrontorigins.S3BucketOrigin_WithOriginAccessControl(c.viewBucket, &awscloudfrontorigins.S3BucketOriginWithOACProps{}),
				ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
				ResponseHeadersPolicy: awscloudfront.NewResponseHeadersPolicy(
					c.stack,
					jsii.String("ResponseHeadersPolicy"),
					&awscloudfront.ResponseHeadersPolicyProps{
						CustomHeadersBehavior: &awscloudfront.ResponseCustomHeadersBehavior{
							CustomHeaders: &[]*awscloudfront.ResponseCustomHeader{
								{
									Header:   jsii.String("Cross-Origin-Opener-Policy"),
									Value:    jsii.String("same-origin"),
									Override: jsii.Bool(true),
								},
								{
									Header:   jsii.String("Cross-Origin-Embedder-Policy"),
									Value:    jsii.String("require-corp"),
									Override: jsii.Bool(true),
								},
							},
						},
					},
				),
				FunctionAssociations: &[]*awscloudfront.FunctionAssociation{
					{
						EventType: awscloudfront.FunctionEventType_VIEWER_REQUEST,
						Function: awscloudfront.NewFunction(
							c.stack,
							jsii.String("RewritePathForSpaFunction"),
							&awscloudfront.FunctionProps{
								Code: awscloudfront.FunctionCode_FromFile(&awscloudfront.FileCodeOptions{
									FilePath: jsii.String("/sources/cdk-share/lambda/cloudfront_rewrite_path_for_spa/main.js"),
								}),
							},
						),
					},
				},
			},
			DomainNames: jsii.Strings(c.domain()),
		})

	if c.stage == "dev" {
		// noop
	} else {
		apigDomain := fmt.Sprintf("%s.execute-api.%s.amazonaws.com", *c.mainApi.ApiId(), *c.stack.Region())
		apigOrigin := awscloudfrontorigins.NewHttpOrigin(jsii.String(apigDomain), &awscloudfrontorigins.HttpOriginProps{})
		cacheDisableOptions := &awscloudfront.AddBehaviorOptions{
			OriginRequestPolicy:  awscloudfront.OriginRequestPolicy_ALL_VIEWER_EXCEPT_HOST_HEADER(),
			ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
			AllowedMethods:       awscloudfront.AllowedMethods_ALLOW_ALL(),
			CachePolicy:          awscloudfront.CachePolicy_CACHING_DISABLED(),
		}
		cdn.AddBehavior(jsii.String("/api/*"), apigOrigin, cacheDisableOptions)
	}
	c.cdn = cdn
}

func (c *AppContainer) buildMainAPI() {
	api := awsapigatewayv2.NewHttpApi(
		c.stack,
		jsii.Sprintf("%s-%s-main-api", c.appName, c.stage),
		&awsapigatewayv2.HttpApiProps{},
	)
	integration := awsapigatewayv2integrations.NewHttpLambdaIntegration(
		jsii.String("MainLambdaIntegration"),
		c.apiFunc,
		&awsapigatewayv2integrations.HttpLambdaIntegrationProps{
			ParameterMapping: awsapigatewayv2.
				NewParameterMapping().
				OverwritePath(
					awsapigatewayv2.NewMappingValue(jsii.String("$request.path.proxy")),
				),
		},
	)
	api.AddRoutes(&awsapigatewayv2.AddRoutesOptions{
		Integration: integration,
		Path:        jsii.String("/api/{proxy+}"),
	})
	c.mainApi = api
}

func (c *AppContainer) buildApiFunction() {
	f := awslambda.NewFunction(
		c.stack,
		jsii.String("ApiFunc"),
		&awslambda.FunctionProps{
			Architecture:  awslambda.Architecture_ARM_64(),
			LogGroup:      c.logGroup,
			LoggingFormat: awslambda.LoggingFormat_JSON,
			Timeout:       awscdk.Duration_Seconds(jsii.Number(5)),
			Handler:       jsii.String("bootstrap"),
			Runtime:       awslambda.Runtime_PROVIDED_AL2023(),
			Code: awslambda.AssetCode_FromAsset(
				jsii.String("../cmd/lambda/api/build"),
				&awss3assets.AssetOptions{},
			),
			Environment: &map[string]*string{"STAGE": jsii.String(c.stage)},
		})
	f.AddToRolePolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Actions:   &[]*string{jsii.String("ssm:Get*")},
		Resources: &[]*string{jsii.String("*")},
	}))
	c.apiFunc = f
}

func (c *AppContainer) buildViewBucket() {
	bucket := awss3.NewBucket(c.stack, jsii.String("ViewBucket"), &awss3.BucketProps{
		AutoDeleteObjects: jsii.Bool(true),
		RemovalPolicy:     awscdk.RemovalPolicy_DESTROY,
	})
	awss3deployment.NewBucketDeployment(
		c.stack,
		jsii.String("ViewBucketDeployment"),
		&awss3deployment.BucketDeploymentProps{
			DestinationBucket: bucket,
			Sources: &[]awss3deployment.ISource{
				awss3deployment.Source_Asset(
					jsii.String("../view/dist"),
					&awss3assets.AssetOptions{},
				),
			},
		})
	c.viewBucket = bucket
	c.setParam("s3/view", *bucket.BucketName())
}

func (c *AppContainer) buildViewCacheClearFunction() {
	f := awslambda.NewFunction(
		c.stack,
		jsii.String("ViewCacheClearFunc"),
		&awslambda.FunctionProps{
			Architecture:  awslambda.Architecture_ARM_64(),
			LogGroup:      c.logGroup,
			LoggingFormat: awslambda.LoggingFormat_JSON,
			Timeout:       awscdk.Duration_Seconds(jsii.Number(30)),
			Handler:       jsii.String("bootstrap"),
			Runtime:       awslambda.Runtime_PROVIDED_AL2023(),
			Code: awslambda.AssetCode_FromAsset(
				jsii.String("/sources/cdk-share/lambda/cloudfront_create_invalidation/build"),
				&awss3assets.AssetOptions{},
			),
			Environment: &map[string]*string{
				"CLOUDFRONT_DISTRIBUTION_ID": jsii.String(*c.cdn.DistributionId()),
			},
		})
	c.cdn.GrantCreateInvalidation(f)
	f.AddEventSource(awslambdaeventsources.NewS3EventSource(
		c.viewBucket,
		&awslambdaeventsources.S3EventSourceProps{
			Events: &[]awss3.EventType{
				awss3.EventType_OBJECT_CREATED,
			},
			Filters: &[]*awss3.NotificationKeyFilter{
				{Suffix: jsii.String("index.html")},
			},
		},
	))
	f.AddEventSource(awslambdaeventsources.NewS3EventSource(
		c.viewBucket,
		&awslambdaeventsources.S3EventSourceProps{
			Events: &[]awss3.EventType{
				awss3.EventType_OBJECT_CREATED,
			},
			Filters: &[]*awss3.NotificationKeyFilter{
				{Suffix: jsii.String("sw.js")},
			},
		},
	))
	f.AddEventSource(awslambdaeventsources.NewS3EventSource(
		c.viewBucket,
		&awslambdaeventsources.S3EventSourceProps{
			Events: &[]awss3.EventType{
				awss3.EventType_OBJECT_CREATED,
			},
			Filters: &[]*awss3.NotificationKeyFilter{
				{Suffix: jsii.String("manifest.webmanifest")},
			},
		},
	))
}

func (c *AppContainer) buildDNS() {
	dns := awsroute53.HostedZone_FromLookup(
		c.stack,
		jsii.String("DnsHostZone"),
		&awsroute53.HostedZoneProviderProps{
			DomainName: jsii.String("hick-r.com"),
		})
	c.dns = dns
}

func (c *AppContainer) buildAuth() {
	userPoolClient := awscognito.NewUserPoolClient(
		c.stack,
		jsii.String("UserPoolClient"),
		&awscognito.UserPoolClientProps{
			UserPool:           c.userPool,
			UserPoolClientName: jsii.Sprintf("%s-%s", c.appName, c.stage),
			SupportedIdentityProviders: &[]awscognito.UserPoolClientIdentityProvider{
				awscognito.UserPoolClientIdentityProvider_GOOGLE(),
				awscognito.UserPoolClientIdentityProvider_COGNITO(),
			},
			AuthFlows: &awscognito.AuthFlow{
				User:    jsii.Bool(true),
				UserSrp: jsii.Bool(true),
			},
			OAuth: &awscognito.OAuthSettings{
				CallbackUrls: &[]*string{
					jsii.String("https://" + c.domain()),
				},
				LogoutUrls: &[]*string{
					jsii.String("https://" + c.domain()),
				},
				Flows: &awscognito.OAuthFlows{
					AuthorizationCodeGrant: jsii.Bool(true),
				},
				Scopes: &[]awscognito.OAuthScope{
					awscognito.OAuthScope_OPENID(),
					awscognito.OAuthScope_PROFILE(),
					awscognito.OAuthScope_EMAIL(),
				},
			},
		},
	)

	awscognito.NewCfnManagedLoginBranding(
		c.stack,
		jsii.String("LoginBranding"),
		&awscognito.CfnManagedLoginBrandingProps{
			UserPoolId:               c.userPool.UserPoolId(),
			ClientId:                 userPoolClient.UserPoolClientId(),
			UseCognitoProvidedValues: jsii.Bool(true),
		},
	)

	c.userPoolClient = userPoolClient
	c.setParam("cognito/userpool/clientid", *userPoolClient.UserPoolClientId())
}

func (c *AppContainer) buildMainRecord() {
	var target awsroute53.RecordTarget
	if c.stage == "dev" {
		target = awsroute53.RecordTarget_FromIpAddresses(
			jsii.String(os.Getenv("IP")),
		)
	} else {
		target = awsroute53.RecordTarget_FromAlias(
			awsroute53targets.NewCloudFrontTarget(c.cdn),
		)
	}
	record := awsroute53.NewARecord(
		c.stack,
		jsii.String("MainDnsRecord"),
		&awsroute53.ARecordProps{
			Zone:       c.dns,
			Target:     target,
			RecordName: jsii.String(c.domain()),
		},
	)
	c.mainRecord = record
}

func (c *AppContainer) domain() string {
	return GetDomain(c.appName, c.stage)
}

func (c *AppContainer) setParam(key, val string) {
	SetParam(c.stack, c.appName, c.stage, key, val)
}
