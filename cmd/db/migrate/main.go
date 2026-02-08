package main

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	con, err := dbcon.NewConnection()
	if err != nil {
		panic(err)
	}
	defer con.Close()

	driver, err := mysql.WithInstance(con, &mysql.Config{})
	if err != nil {
		panic(err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://sql",
		env.AppName(),
		driver,
	)
	if err != nil {
		panic(err)
	}

	if err := m.Down(); err != nil {
		if err != migrate.ErrNoChange {
			panic(err)
		}
	}

	if err := m.Migrate(2); err != nil {
		if err != migrate.ErrNoChange {
			panic(err)
		}
	}

	fmt.Println("Migration applied successfully")
}
