package dbcon

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	secret "github.com/fourbetween/pkg-secret"
	_ "github.com/go-sql-driver/mysql"
)

func NewConnection() (*sql.DB, error) {
	var dsn string
	var err error
	if env.IsDev() {
		dsn, err = getLocalDSN()
	} else {
		if env.IsLambda() {
			dsn, err = getRDSDSN()
			if err != nil {
				return nil, err
			}
		} else {
			dsn, err = getPortforwardRDSDSN()
			if err != nil {
				return nil, err
			}
		}
	}
	if err != nil {
		return nil, err
	}

	con, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	if err := con.Ping(); err != nil {
		return nil, err
	}
	return con, nil
}

func getLocalDSN() (string, error) {
	app := env.AppName()
	return "root:password@tcp(mysql:3306)/" + app + "?multiStatements=true", nil
}

func getRDSDSN() (string, error) {
	cfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithUseDualStackEndpoint(aws.DualStackEndpointStateEnabled),
	)
	if err != nil {
		return "", fmt.Errorf("failed to load aws config for rds: %w", err)
	}
	s, err := secret.NewSecret("share", cfg)
	if err != nil {
		return "", err
	}
	username, err := s.Get("username")
	if err != nil {
		return "", err
	}
	password, err := s.Get("password")
	if err != nil {
		return "", err
	}
	host, err := s.Get("host")
	if err != nil {
		return "", err
	}
	port, err := s.Get("port")
	if err != nil {
		return "", err
	}
	app := env.AppName()
	dsn := username + ":" + password + "@tcp(" + host + ":" + port + ")/" + app + "?tls=skip-verify&charset=utf8mb4&parseTime=true&multiStatements=true"
	return dsn, nil
}

func getPortforwardRDSDSN() (string, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return "", fmt.Errorf("failed to load aws config for rds: %w", err)
	}
	s, err := secret.NewSecret("share", cfg)
	if err != nil {
		return "", err
	}
	username, err := s.Get("username")
	if err != nil {
		return "", err
	}
	password, err := s.Get("password")
	if err != nil {
		return "", err
	}
	host := "host.docker.internal"
	port := "33060"
	app := env.AppName()
	dsn := username + ":" + password + "@tcp(" + host + ":" + port + ")/" + app + "?charset=utf8mb4&parseTime=true&multiStatements=true"
	return dsn, nil
}
