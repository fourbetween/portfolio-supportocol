package main

import (
	"context"
	"slices"

	"github.com/fourbetween/app-supportocol/internal/db"
	conf "github.com/fourbetween/pkg-conf"
	"github.com/go-jet/jet/v2/generator/metadata"
	"github.com/go-jet/jet/v2/generator/postgres"
	"github.com/go-jet/jet/v2/generator/template"
	jetpostgres "github.com/go-jet/jet/v2/postgres"
)

func main() {
	dsn, err := conf.GetStringWithStage(context.TODO(), "/app-supportocol/db/dsn")
	if err != nil {
		panic(err)
	}

	dbCon, err := db.NewDB(dsn)
	if err != nil {
		panic(err)
	}

	excludeTables := []string{"schema_lock", "schema_migrations"}
	tmpl := template.Default(jetpostgres.Dialect).UseSchema(func(s metadata.Schema) template.Schema {
		return template.DefaultSchema(s).
			UseModel(
				template.DefaultModel().
					UseTable(func(t metadata.Table) template.TableModel {
						tm := template.DefaultTableModel(t)
						if slices.Contains(excludeTables, t.Name) {
							tm.Skip = true
						}
						return tm
					}),
			).
			UseSQLBuilder(
				template.DefaultSQLBuilder().
					UseTable(func(t metadata.Table) template.TableSQLBuilder {
						tb := template.DefaultTableSQLBuilder(t)
						if slices.Contains(excludeTables, t.Name) {
							tb.Skip = true
						}
						return tb
					}),
			)
	})

	if err := postgres.GenerateDB(
		dbCon,
		"public",
		"../../../internal/db/.gen",
		tmpl,
	); err != nil {
		panic(err)
	}
}
