package main

import (
	"slices"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/go-jet/jet/v2/generator/metadata"
	"github.com/go-jet/jet/v2/generator/mysql"
	"github.com/go-jet/jet/v2/generator/template"
	jetmysql "github.com/go-jet/jet/v2/mysql"
)

func main() {
	con, err := dbcon.NewConnection()
	if err != nil {
		panic(err)
	}

	if err := mysql.GenerateDB(
		con,
		env.AppName(),
		"../../../internal/identity/infra/db/schema",
		makeTmpl([]string{"users"}),
	); err != nil {
		panic(err)
	}

	if err := mysql.GenerateDB(
		con,
		env.AppName(),
		"../../../internal/workspace/infra/db/schema",
		makeTmpl([]string{"workspaces", "members", "projects", "favorite_discussions", "discussions"}),
	); err != nil {
		panic(err)
	}

	if err := mysql.GenerateDB(
		con,
		env.AppName(),
		"../../../internal/learning/infra/db/schema",
		makeTmpl([]string{"discussions", "comments", "comment_issues", "dialogue_settings"}),
	); err != nil {
		panic(err)
	}

	if err := mysql.GenerateDB(
		con,
		env.AppName(),
		"../../../internal/dialogue/infra/db/schema",
		makeTmpl([]string{"discussions", "comments", "comment_issues", "dialogue_settings"}),
	); err != nil {
		panic(err)
	}
}

func makeTmpl(tables []string) template.Template {
	return template.Default(jetmysql.Dialect).UseSchema(func(s metadata.Schema) template.Schema {
		return template.DefaultSchema(s).
			UseModel(
				template.DefaultModel().
					UseTable(func(t metadata.Table) template.TableModel {
						tm := template.DefaultTableModel(t)
						if !slices.Contains(tables, t.Name) {
							tm.Skip = true
						}
						return tm
					}),
			).
			UseSQLBuilder(
				template.DefaultSQLBuilder().
					UseTable(func(t metadata.Table) template.TableSQLBuilder {
						tb := template.DefaultTableSQLBuilder(t)
						if !slices.Contains(tables, t.Name) {
							tb.Skip = true
						}
						return tb
					}),
			)
	})
}
