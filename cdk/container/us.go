package container

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscertificatemanager"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsroute53"
	"github.com/aws/jsii-runtime-go"
)

type (
	UsContainer struct {
		appName string
		stack   awscdk.Stack
		stage   string
		dns     awsroute53.IHostedZone
		Cert    awscertificatemanager.Certificate
	}

	UsContainerProps struct {
		AppName    string
		App        awscdk.App
		StackProps awscdk.StackProps
		Stage      string
	}
)

func NewUsContainer(p UsContainerProps) *UsContainer {
	c := &UsContainer{
		appName: p.AppName,
		stack: awscdk.NewStack(
			p.App,
			jsii.String(StackName(p.AppName+"-cert", p.Stage)),
			&p.StackProps,
		),
		stage: p.Stage,
	}

	c.buildDNS()
	c.buildCert()

	return c
}
func (c *UsContainer) buildDNS() {
	dns := awsroute53.HostedZone_FromLookup(
		c.stack,
		jsii.String("Dns"),
		&awsroute53.HostedZoneProviderProps{
			DomainName: jsii.String("hick-r.com"),
		},
	)
	c.dns = dns
}

func (c *UsContainer) buildCert() {
	cert := c.cert("AppCertificate", c.domain(c.appName))
	c.Cert = cert
}

func (c *UsContainer) cert(id, domain string) awscertificatemanager.Certificate {
	return awscertificatemanager.NewCertificate(
		c.stack,
		jsii.String(id),
		&awscertificatemanager.CertificateProps{
			DomainName: jsii.String(domain),
			Validation: awscertificatemanager.CertificateValidation_FromDns(c.dns),
		})
}

func (c *UsContainer) domain(appName string) string {
	return GetDomain(appName, c.stage)
}
