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

		vpc        awsec2.IVpc
		secret     awssecretsmanager.ISecret
		rds        awsrds.IDatabaseInstance
		logGroup   awslogs.ILogGroup
		viewBucket awss3.Bucket
		apiFunc    awslambda.Function
		mainApi    awsapigatewayv2.HttpApi
		cdn        awscloudfront.Distribution
		dns        awsroute53.IHostedZone
		mainRecord awsroute53.ARecord
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

	if c.stage != "dev" {
		// shared resources
		c.buildVPC()
		c.buildSecret()
		c.buildRDS()
		c.buildLogGroup()
		c.buildDNS()

		// app resources
		c.buildViewBucket()
		c.buildApiFunction()
		c.buildMainAPI()
		c.buildCDN()
		c.buildViewCacheClearFunction()
		c.buildMainRecord()
	}

	return c
}

func (c *AppContainer) buildVPC() {
	vpcID, _ := c.shareConf.Get("vpc/id")
	publicIDs := []*string{}
	privateIDs := []*string{}
	isolatedIDs := []*string{}
	for i := range []int{0, 1} {
		publicID, _ := c.shareConf.Get(fmt.Sprintf("vpc/subnet/public/%d/id", i))
		privateID, _ := c.shareConf.Get(fmt.Sprintf("vpc/subnet/private/%d/id", i))
		isolatedID, _ := c.shareConf.Get(fmt.Sprintf("vpc/subnet/isolated/%d/id", i))
		publicIDs = append(publicIDs, jsii.String(publicID))
		privateIDs = append(privateIDs, jsii.String(privateID))
		isolatedIDs = append(isolatedIDs, jsii.String(isolatedID))
	}

	c.vpc = awsec2.Vpc_FromVpcAttributes(
		c.stack,
		jsii.String("VPC"),
		&awsec2.VpcAttributes{
			AvailabilityZones: jsii.Strings("ap-northeast-1a", "ap-northeast-1c"),
			VpcId:             jsii.String(vpcID),
			PublicSubnetIds:   &publicIDs,
			PrivateSubnetIds:  &privateIDs,
			IsolatedSubnetIds: &isolatedIDs,
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

func (c *AppContainer) buildCDN() {
	cdn := awscloudfront.NewDistribution(
		c.stack,
		jsii.String("Cdn"),
		&awscloudfront.DistributionProps{
			PriceClass:        awscloudfront.PriceClass_PRICE_CLASS_200,
			Certificate:       c.certContainer.Cert,
			DefaultRootObject: jsii.String("index.html"),
			DefaultBehavior: &awscloudfront.BehaviorOptions{
				Origin: awscloudfrontorigins.S3BucketOrigin_WithOriginAccessControl(
					c.viewBucket,
					&awscloudfrontorigins.S3BucketOriginWithOACProps{},
				),
				ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
				FunctionAssociations: &[]*awscloudfront.FunctionAssociation{
					{
						EventType: awscloudfront.FunctionEventType_VIEWER_REQUEST,
						Function: awscloudfront.NewFunction(
							c.stack,
							jsii.String("RewritePathFunctionForSpa"),
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

	apigDomain := fmt.Sprintf("%s.execute-api.%s.amazonaws.com", *c.mainApi.ApiId(), *c.stack.Region())
	apigOrigin := awscloudfrontorigins.NewHttpOrigin(jsii.String(apigDomain), &awscloudfrontorigins.HttpOriginProps{})
	cacheDisableOptions := &awscloudfront.AddBehaviorOptions{
		OriginRequestPolicy:  awscloudfront.OriginRequestPolicy_ALL_VIEWER_EXCEPT_HOST_HEADER(),
		ViewerProtocolPolicy: awscloudfront.ViewerProtocolPolicy_REDIRECT_TO_HTTPS,
		AllowedMethods:       awscloudfront.AllowedMethods_ALLOW_ALL(),
		CachePolicy:          awscloudfront.CachePolicy_CACHING_DISABLED(),
	}
	cdn.AddBehavior(jsii.String("/api/*"), apigOrigin, cacheDisableOptions)

	c.cdn = cdn
}

func (c *AppContainer) buildMainAPI() {
	api := awsapigatewayv2.NewHttpApi(
		c.stack,
		jsii.Sprintf("%s-main-api", c.appName),
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
			Environment: &map[string]*string{
				"APP_NAME": jsii.String(c.appName),
				"STAGE":    jsii.String(c.stage),
			},
			Vpc: c.vpc,
		})
	f.AddToRolePolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Actions:   &[]*string{jsii.String("ssm:Get*")},
		Resources: &[]*string{jsii.String("*")},
	}))
	c.secret.GrantRead(f, nil)
	c.rds.Connections().AllowDefaultPortFrom(f, nil)
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

func (c *AppContainer) buildMainRecord() {
	target := awsroute53.RecordTarget_FromAlias(
		awsroute53targets.NewCloudFrontTarget(c.cdn),
	)
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
	return getDomain(c.appName, c.stage)
}

func (c *AppContainer) setParam(key, val string) {
	setParam(c.stack, c.appName, key, val)
}
