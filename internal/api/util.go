package api

import (
	"context"

	conf "github.com/fourbetween/pkg-conf"
)

func CheckConfig() error {
	return conf.ValidateAll(
		context.TODO(),
		[]string{
			"/share/cognito/userpool/id",
		},
		[]string{
			"/app-supportocol/db/dsn",
		},
	)
}
