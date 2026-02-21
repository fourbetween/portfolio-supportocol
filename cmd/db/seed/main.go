package main

import (
	"context"
	"fmt"
	"log"

	"github.com/fourbetween/app-supportocol/internal/pkg/dbcon"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db"
)

var plans = []domain.Plan{
	{
		ID:             "4c4ca77d-4a51-463e-9345-da27010cb450",
		Name:           "Free",
		Description:    "Free plan for personal use.",
		MonthlyAILimit: 0,
	},
	{
		ID:             "cbe0d635-c20c-4c06-9933-1979fac9f5af",
		Name:           "Standard",
		Description:    "Standard plan. 300 AI credits per month.",
		MonthlyAILimit: 300,
	},
}

func main() {
	con, err := dbcon.NewConnection()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer con.Close()

	planRepo := db.NewPlanRepository(con)
	ctx := context.Background()

	for _, plan := range plans {
		if err := plan.Validate(); err != nil {
			log.Fatalf("invalid plan %q: %v", plan.ID, err)
		}
		if err := planRepo.Save(ctx, plan); err != nil {
			log.Fatalf("failed to seed plan %q: %v", plan.ID, err)
		}
		fmt.Printf("seeded plan: %s\n", plan.ID)
	}

	fmt.Println("seed completed successfully")
}
