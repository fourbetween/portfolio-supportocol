package main

import (
	"context"
	"strings"

	conf "github.com/fourbetween/pkg-conf"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/cockroachdb"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	dsn, err := conf.GetStringWithStage(context.TODO(), "/app-supportocol/db/dsn")
	if err != nil {
		panic(err)
	}

	if conf.Stage() == "prod" {
		dsn = strings.Replace(
			dsn,
			"postgresql:",
			"cockroachdb:",
			1,
		)
	}

	m, err := migrate.New(
		"file://../../../internal/db/migrations",
		dsn,
	)
	if err != nil {
		panic(err)
	}

	if err := m.Down(); err != nil {
		if err != migrate.ErrNoChange {
			panic(err)
		}
	}

	if err := m.Up(); err != nil {
		if err != migrate.ErrNoChange {
			panic(err)
		}
	}
}
