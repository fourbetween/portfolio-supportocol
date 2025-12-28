package main

import (
	"fmt"
	"net/http"

	"github.com/fourbetween/app-supportocol/cmd/api"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
)

func main() {
	dbCon, err := dbcon.NewConnection()
	if err != nil {
		panic(fmt.Errorf("failed to connect to db: %w", err))
	}

	handler, err := api.NewHTTPHandler(dbCon)
	if err != nil {
		panic(err)
	}

	if err := http.ListenAndServe(":9000", handler); err != nil {
		panic(err)
	}
}
