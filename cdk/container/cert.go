package container

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscertificatemanager"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsroute53"
	"github.com/aws/jsii-runtime-go"
)

type (
	CertContainer struct {
		appName string
		stack   awscdk.Stack
		stage   string
		dns     awsroute53.IHostedZone
		AppCert awscertificatemanager.Certificate
		ApiCert awscertificatemanager.Certificate
	}

	CertContainerProps struct {
		AppName    string
		App        awscdk.App
		StackProps awscdk.StackProps
		Stage      string
	}
)

func NewCertContainer(p CertContainerProps) *CertContainer {
	c := &CertContainer{
		appName: p.AppName,
		stack: awscdk.NewStack(
			p.App,
			jsii.String(p.AppName+"-cert"),
			&p.StackProps,
		),
		stage: p.Stage,
	}

	c.buildDNS()
	c.buildCerts()

	return c
}

func (c *CertContainer) buildDNS() {
	dns := awsroute53.HostedZone_FromLookup(
		c.stack,
		jsii.String("Dns"),
		&awsroute53.HostedZoneProviderProps{
			DomainName: jsii.String(getRootDomain()),
		},
	)
	c.dns = dns
}

func (c *CertContainer) buildCerts() {
	c.AppCert = c.cert("AppCertificate", getDomain(c.appName, c.stage))
	c.ApiCert = c.cert("ApiCertificate", getAPIDomain(c.appName, c.stage))
}

func (c *CertContainer) cert(id, domain string) awscertificatemanager.Certificate {
	return awscertificatemanager.NewCertificate(
		c.stack,
		jsii.String(id),
		&awscertificatemanager.CertificateProps{
			DomainName: jsii.String(domain),
			Validation: awscertificatemanager.CertificateValidation_FromDns(c.dns),
		})
}
