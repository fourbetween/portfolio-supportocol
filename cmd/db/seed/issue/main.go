package main

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/infra/db"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

func main() {
	con, err := dbcon.NewConnection()
	if err != nil {
		panic(err)
	}
	defer con.Close()

	idSrv := id.NewUUIDService()
	issueFac := domain.NewIssueFactory(idSrv)
	issueRepo := db.NewIssueRepository(con, issueFac)

	ctx := context.Background()

	issues := []domain.CreateIssueParams{
		{
			IssueType:   "logical_contradiction",
			Description: "There is a logical contradiction in the argument.",
			Status:      domain.IssueStatusOpen,
		},
		{
			IssueType:   "lack_of_evidence",
			Description: "There is a lack of evidence for the claim.",
			Status:      domain.IssueStatusOpen,
		},
		{
			IssueType:   "point_shifting",
			Description: "The argument is shifting the point of discussion.",
			Status:      domain.IssueStatusOpen,
		},
	}

	for _, p := range issues {
		i, err := issueFac.Create(p)
		if err != nil {
			panic(err)
		}
		if err := issueRepo.Save(ctx, i); err != nil {
			panic(err)
		}
	}

	fmt.Println("Issues seeded successfully")
}
