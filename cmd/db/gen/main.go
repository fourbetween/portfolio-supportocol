package main

import (
	"slices"

	"github.com/fourbetween/app-supportocol/internal/db"
	"github.com/fourbetween/app-supportocol/internal/service/env"
	"github.com/go-jet/jet/v2/generator/metadata"
	"github.com/go-jet/jet/v2/generator/mysql"
	"github.com/go-jet/jet/v2/generator/template"
	jetmysql "github.com/go-jet/jet/v2/mysql"
)

func main() {
	con, err := db.NewConnection()
	if err != nil {
		panic(err)
	}

	excludeTables := []string{"schema_lock", "schema_migrations"}
	tmpl := template.Default(jetmysql.Dialect).UseSchema(func(s metadata.Schema) template.Schema {
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

	if err := mysql.GenerateDB(
		con,
		env.AppName(),
		"../../../internal/db/.gen",
		tmpl,
	); err != nil {
		panic(err)
	}
}
