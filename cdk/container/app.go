package container

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigatewayv2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigatewayv2integrations"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfront"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscloudfrontorigins"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambdaeventsources"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslogs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsrds"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsroute53"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsroute53targets"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3assets"
	"github.com/aws/aws-cdk-go/awscdk/v2/awss3deployment"
	"github.com/aws/aws-cdk-go/awscdk/v2/awssecretsmanager"
	"github.com/aws/aws-cdk-go/awscdk/v2/awssqs"
	"github.com/aws/jsii-runtime-go"
	"github.com/fourbetween/pkg-conf/conf"
)

type (
	AppContainer struct {
		appName       string
		stack         awscdk.Stack
		stage         string
		certContainer *CertContainer
		shareConf     conf.Service

		vpc             awsec2.IVpc
		secret          awssecretsmanager.ISecret
		rds             awsrds.IDatabaseInstance
		logGroup        awslogs.ILogGroup
		viewBucket      awss3.Bucket
		commentGenQueue awssqs.IQueue
		apiFunc         awslambda.Alias
		apiApig         awsapigatewayv2.HttpApi
		viewCdn         awscloudfront.Distribution
		apiCdn          awscloudfront.Distribution
		dns             awsroute53.IHostedZone
	}

	AppContainerProps struct {
		AppName       string
		App           awscdk.App
		StackProps    awscdk.StackProps
		Stage         string
		CertContainer *CertContainer
		ShareConf     conf.Service
	}
)

func NewAppContainer(p AppContainerProps) *AppContainer {
	c := &AppContainer{
		appName: p.AppName,
		stack: awscdk.NewStack(
			p.App,
			jsii.String(p.AppName),
			&p.StackProps,
		),
		stage:         p.Stage,
		certContainer: p.CertContainer,
		shareConf:     p.ShareConf,
	}

	c.setParam("domain", c.domain())
	c.buildCommentGenQueue()

	if c.stage != "dev" {
		// shared resources
		c.buildVPC()
		c.buildSecret()
		c.buildRDS()
		c.buildLogGroup()
		c.buildDNS()

		// app resources
		c.buildCommentGenFunction()
		c.buildViewBucket()
		c.buildApiFunction()
		c.buildApiApig()
		c.buildApiCDN()
		c.buildViewCDN()
		c.deployView()
		c.buildViewRecord()
		c.buildApiRecord()
	}

	return c
}

func (c *AppContainer) buildCommentGenQueue() {
	dlq := awssqs.NewQueue(
		c.stack,
		jsii.String("CommentGenDeadLetterQueue"),
		&awssqs.QueueProps{
			Fifo:                      jsii.Bool(true),
			ContentBasedDeduplication: jsii.Bool(true),
		},
	)
	queue := awssqs.NewQueue(
		c.stack,
		jsii.String("CommentGenQueue"),
		&awssqs.QueueProps{
			Fifo:                      jsii.Bool(true),
			ContentBasedDeduplication: jsii.Bool(true),
			VisibilityTimeout:         awscdk.Duration_Seconds(jsii.Number(121)),
			DeadLetterQueue: &awssqs.DeadLetterQueue{
				MaxReceiveCount: jsii.Number(3),
				Queue:           dlq,
			},
			ReceiveMessageWaitTime: awscdk.Duration_Seconds(jsii.Number(20)),
		},
	)
	c.commentGenQueue = queue
	c.setParam("sqs/comment-generation/url", *queue.QueueUrl())
}

func (c *AppContainer) buildCommentGenFunction() {
	f := awslambda.NewFunction(
		c.stack,
		jsii.String("CommentGenFunc"),
		&awslambda.FunctionProps{
			Architecture:  awslambda.Architecture_ARM_64(),
			LogGroup:      c.logGroup,
			LoggingFormat: awslambda.LoggingFormat_JSON,
			Timeout:       awscdk.Duration_Seconds(jsii.Number(120)),
			Handler:       jsii.String("bootstrap"),
			Runtime:       awslambda.Runtime_PROVIDED_AL2023(),
			Code: awslambda.AssetCode_FromAsset(
				jsii.String("../cmd/comment-generation/lambda/build"),
				nil,
			),
			Environment:             c.lambdaEnv(),
			Vpc:                     c.vpc,
			Ipv6AllowedForDualStack: jsii.Bool(true),
			AllowAllIpv6Outbound:    jsii.Bool(true),
		})
	f.AddEventSource(awslambdaeventsources.NewSqsEventSource(
		c.commentGenQueue,
		&awslambdaeventsources.SqsEventSourceProps{
			BatchSize:               jsii.Number(1),
			MaxConcurrency:          jsii.Number(5),
			ReportBatchItemFailures: jsii.Bool(true),
		},
	))
	c.commentGenQueue.GrantConsumeMessages(f)
	c.setLambdaBasePermissions(f)
}

func (c *AppContainer) buildVPC() {
	vpcID, _ := c.shareConf.Get("vpc/id")
	c.vpc = awsec2.Vpc_FromLookup(
		c.stack,
		jsii.String("VPC"),
		&awsec2.VpcLookupOptions{
			VpcId: jsii.String(vpcID),
		},
	)
}

func (c *AppContainer) buildSecret() {
	secretArn, _ := c.shareConf.Get("secret/arn")
	c.secret = awssecretsmanager.Secret_FromSecretCompleteArn(c.stack, jsii.String("ShareSecret"), jsii.String(secretArn))
}

func (c *AppContainer) buildRDS() {
	rdsInstanceId, _ := c.shareConf.Get("rds/instance/id")
	c.rds = awsrds.DatabaseInstance_FromLookup(c.stack, jsii.String("ShareRDS"), &awsrds.DatabaseInstanceLookupOptions{
		InstanceIdentifier: jsii.String(rdsInstanceId),
	})
}

func (c *AppContainer) buildLogGroup() {
	loggroupArn, _ := c.shareConf.Get("loggroup/arn")
	c.logGroup = awslogs.LogGroup_FromLogGroupArn(c.stack, jsii.String("ShareLogGroup"), jsii.String(loggroupArn))
}

func (c *AppContainer) buildViewCDN() {
	cdn := awscloudfront.NewDistribution(
		c.stack,
		jsii.String("ViewCdn"),
		&awscloudfront.DistributionProps{
			EnableIpv6:        jsii.Bool(true),
			PriceClass:        awscloudfront.PriceClass_PRICE_CLASS_200,
			Certificate:       c.certContainer.AppCert,
			DefaultRootObject: jsii.String("index.html"),
			DefaultBehavior: &awscloudfront.BehaviorOptions{
				Origin: awscloudfrontorigins.S3BucketOrigin_WithOriginAccessControl(
					c.viewBucket,
					nil,
				),
				ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
				CachePolicy:          awscloudfront.CachePolicy_CACHING_OPTIMIZED(),
			},
			DomainNames: jsii.Strings(c.domain()),
			ErrorResponses: &[]*awscloudfront.ErrorResponse{
				{
					HttpStatus:         jsii.Number(403),
					ResponseHttpStatus: jsii.Number(200),
					ResponsePagePath:   jsii.String("/index.html"),
					Ttl:                awscdk.Duration_Seconds(jsii.Number(0)),
				},
				{
					HttpStatus:         jsii.Number(404),
					ResponseHttpStatus: jsii.Number(200),
					ResponsePagePath:   jsii.String("/index.html"),
					Ttl:                awscdk.Duration_Seconds(jsii.Number(0)),
				},
			},
		})

	c.viewCdn = cdn
}

func (c *AppContainer) buildApiCDN() {
	apigDomain := fmt.Sprintf("%s.execute-api.%s.amazonaws.com", *c.apiApig.ApiId(), *c.stack.Region())
	apigOrigin := awscloudfrontorigins.NewHttpOrigin(jsii.String(apigDomain), &awscloudfrontorigins.HttpOriginProps{})
	apiCdn := awscloudfront.NewDistribution(
		c.stack,
		jsii.String("ApiCdn"),
		&awscloudfront.DistributionProps{
			EnableIpv6:  jsii.Bool(true),
			PriceClass:  awscloudfront.PriceClass_PRICE_CLASS_200,
			Certificate: c.certContainer.ApiCert,
			DefaultBehavior: &awscloudfront.BehaviorOptions{
				Origin:               apigOrigin,
				OriginRequestPolicy:  awscloudfront.OriginRequestPolicy_ALL_VIEWER_EXCEPT_HOST_HEADER(),
				ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
				AllowedMethods:       awscloudfront.AllowedMethods_ALLOW_ALL(),
				CachePolicy:          awscloudfront.CachePolicy_CACHING_DISABLED(),
			},
			AdditionalBehaviors: &map[string]*awscloudfront.BehaviorOptions{
				"/v1/dialogue/*": {
					Origin:               apigOrigin,
					OriginRequestPolicy:  awscloudfront.OriginRequestPolicy_ALL_VIEWER_EXCEPT_HOST_HEADER(),
					ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
					AllowedMethods:       awscloudfront.AllowedMethods_ALLOW_ALL(),
					CachePolicy: awscloudfront.NewCachePolicy(
						c.stack,
						jsii.String("DialogueCachePolicy"),
						&awscloudfront.CachePolicyProps{
							MinTtl:                     awscdk.Duration_Seconds(jsii.Number(0)),
							DefaultTtl:                 awscdk.Duration_Seconds(jsii.Number(0)),
							MaxTtl:                     awscdk.Duration_Seconds(jsii.Number(300)),
							CookieBehavior:             awscloudfront.CacheCookieBehavior_None(),
							HeaderBehavior:             awscloudfront.CacheHeaderBehavior_None(),
							QueryStringBehavior:        awscloudfront.CacheQueryStringBehavior_All(),
							EnableAcceptEncodingBrotli: jsii.Bool(true),
							EnableAcceptEncodingGzip:   jsii.Bool(true),
						},
					),
				},
			},
			DomainNames: jsii.Strings(getAPIDomain(c.appName, c.stage)),
		},
	)
	c.apiCdn = apiCdn
}

func (c *AppContainer) buildApiApig() {
	api := awsapigatewayv2.NewHttpApi(
		c.stack,
		jsii.Sprintf("%s-api-apig", c.appName),
		nil,
	)
	integration := awsapigatewayv2integrations.NewHttpLambdaIntegration(
		jsii.String("ApiLambdaIntegration"),
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
		Path:        jsii.String("/{proxy+}"),
	})
	c.apiApig = api
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
				jsii.String("../cmd/api/lambda/build"),
				nil,
			),
			Environment:             c.lambdaEnv(),
			Vpc:                     c.vpc,
			Ipv6AllowedForDualStack: jsii.Bool(true),
			AllowAllIpv6Outbound:    jsii.Bool(true),
		})
	alias := awslambda.NewAlias(
		c.stack,
		jsii.String("ApiFuncAlias"),
		&awslambda.AliasProps{
			AliasName:                       jsii.String("prod"),
			Version:                         f.CurrentVersion(),
			ProvisionedConcurrentExecutions: jsii.Number(1),
		},
	)
	f.AddToRolePolicy(
		awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
			Actions: jsii.Strings(
				"ses:SendEmail",
				"ses:SendRawEmail",
				"ses:SendTemplatedEmail",
			),
			Resources: jsii.Strings("arn:aws:ses:ap-northeast-1:966392475035:identity/supportocol.com"),
		}),
	)
	c.commentGenQueue.GrantSendMessages(f)
	c.setLambdaBasePermissions(f)
	c.apiFunc = alias
}

func (c *AppContainer) buildViewBucket() {
	bucket := awss3.NewBucket(c.stack, jsii.String("ViewBucket"), &awss3.BucketProps{
		AutoDeleteObjects: jsii.Bool(true),
		RemovalPolicy:     awscdk.RemovalPolicy_DESTROY,
		BlockPublicAccess: awss3.BlockPublicAccess_BLOCK_ALL(),
	})
	c.viewBucket = bucket
}

func (c *AppContainer) deployView() {
	awss3deployment.NewBucketDeployment(
		c.stack,
		jsii.String("ViewBucketImmutableAssetDeployment"),
		&awss3deployment.BucketDeploymentProps{
			DestinationBucket: c.viewBucket,
			Sources: &[]awss3deployment.ISource{
				awss3deployment.Source_Asset(
					jsii.String("../view/dist"),
					&awss3assets.AssetOptions{
						Exclude: jsii.Strings("*", "!assets", "!assets/**/*", "!workbox-*.js"),
					},
				),
			},
			CacheControl: &[]awss3deployment.CacheControl{
				awss3deployment.CacheControl_SetPublic(),
				awss3deployment.CacheControl_Immutable(),
				awss3deployment.CacheControl_MaxAge(awscdk.Duration_Days(jsii.Number(365))),
			},
			Prune: jsii.Bool(false),
		})
	awss3deployment.NewBucketDeployment(
		c.stack,
		jsii.String("ViewBucketStaticDeployment"),
		&awss3deployment.BucketDeploymentProps{
			DestinationBucket: c.viewBucket,
			Sources: &[]awss3deployment.ISource{
				awss3deployment.Source_Asset(
					jsii.String("../view/dist"),
					&awss3assets.AssetOptions{
						Exclude: jsii.Strings("assets/**/*", "workbox-*.js", "index.html", "sw.js", "registerSW.js", "manifest.webmanifest"),
					},
				),
			},
			CacheControl: &[]awss3deployment.CacheControl{
				awss3deployment.CacheControl_SetPublic(),
				awss3deployment.CacheControl_MaxAge(awscdk.Duration_Days(jsii.Number(1))),
				awss3deployment.CacheControl_StaleWhileRevalidate(awscdk.Duration_Days(jsii.Number(7))),
			},
			Distribution:      c.viewCdn,
			DistributionPaths: jsii.Strings("/favicon.ico", "/images/*"),
			Prune:             jsii.Bool(false),
		})
	awss3deployment.NewBucketDeployment(
		c.stack,
		jsii.String("ViewBucketEntryDeployment"),
		&awss3deployment.BucketDeploymentProps{
			DestinationBucket: c.viewBucket,
			Sources: &[]awss3deployment.ISource{
				awss3deployment.Source_Asset(
					jsii.String("../view/dist"),
					&awss3assets.AssetOptions{
						Exclude: jsii.Strings("*", "!index.html", "!sw.js", "!registerSW.js", "!manifest.webmanifest"),
					},
				),
			},
			CacheControl: &[]awss3deployment.CacheControl{
				awss3deployment.CacheControl_NoCache(),
				awss3deployment.CacheControl_NoStore(),
				awss3deployment.CacheControl_MustRevalidate(),
				awss3deployment.CacheControl_MaxAge(awscdk.Duration_Seconds(jsii.Number(0))),
			},
			Distribution:      c.viewCdn,
			DistributionPaths: jsii.Strings("/", "/index.html", "/sw.js", "/registerSW.js", "/manifest.webmanifest"),
			Prune:             jsii.Bool(false),
		})
}

func (c *AppContainer) buildDNS() {
	dns := awsroute53.HostedZone_FromLookup(
		c.stack,
		jsii.String("DnsHostZone"),
		&awsroute53.HostedZoneProviderProps{
			DomainName: jsii.String(getRootDomain(c.stage)),
		})
	c.dns = dns
}

func (c *AppContainer) buildViewRecord() {
	target := awsroute53.RecordTarget_FromAlias(
		awsroute53targets.NewCloudFrontTarget(c.viewCdn),
	)
	awsroute53.NewARecord(
		c.stack,
		jsii.String("ViewDnsRecord"),
		&awsroute53.ARecordProps{
			Zone:       c.dns,
			Target:     target,
			RecordName: jsii.String(c.domain()),
		},
	)

	awsroute53.NewAaaaRecord(
		c.stack,
		jsii.String("ViewDnsRecordV6"),
		&awsroute53.AaaaRecordProps{
			Zone:       c.dns,
			Target:     target,
			RecordName: jsii.String(c.domain()),
		},
	)
}

func (c *AppContainer) buildApiRecord() {
	target := awsroute53.RecordTarget_FromAlias(
		awsroute53targets.NewCloudFrontTarget(c.apiCdn),
	)
	awsroute53.NewARecord(
		c.stack,
		jsii.String("ApiDnsRecord"),
		&awsroute53.ARecordProps{
			Zone:       c.dns,
			Target:     target,
			RecordName: jsii.String(getAPIDomain(c.appName, c.stage)),
		},
	)
	awsroute53.NewAaaaRecord(
		c.stack,
		jsii.String("ApiDnsRecordV6"),
		&awsroute53.AaaaRecordProps{
			Zone:       c.dns,
			Target:     target,
			RecordName: jsii.String(getAPIDomain(c.appName, c.stage)),
		},
	)
}

func (c *AppContainer) domain() string {
	return getDomain(c.appName, c.stage)
}

func (c *AppContainer) setParam(key, val string) {
	setParam(c.stack, c.appName, key, val)
}

func (c *AppContainer) setLambdaBasePermissions(f awslambda.Function) {
	f.AddToRolePolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Actions:   &[]*string{jsii.String("ssm:Get*")},
		Resources: &[]*string{jsii.String("*")},
	}))
	c.secret.GrantRead(f, nil)
	c.rds.Connections().AllowDefaultPortFrom(f, nil)
}

func (c *AppContainer) lambdaEnv() *map[string]*string {
	env := map[string]*string{
		"APP_NAME": jsii.String(c.appName),
		"STAGE":    jsii.String(c.stage),
	}
	return &env
}
