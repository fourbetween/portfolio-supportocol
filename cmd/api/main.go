package main

import (
	"fmt"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal/api"
	"github.com/fourbetween/app-supportocol/internal/db"
)

func main() {
	dbCon, err := db.NewConnection()
	if err != nil {
		panic(fmt.Errorf("failed to connect to db: %w", err))
	}

	handler, err := api.NewHttpHandler(dbCon)
	if err != nil {
		panic(err)
	}

	if err := http.ListenAndServe(":9000", handler); err != nil {
		panic(err)
	}
}
