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
		ID:             domain.PlanIDFree,
		Name:           "Free",
		Description:    "Free plan for personal use.",
		MonthlyAILimit: 20,
		MaxProjects:    20,
		MaxFavorites:   100,
	},
	{
		ID:             domain.PlanIDStandard,
		Name:           "Standard",
		Description:    "Standard plan. 300 AI credits per month.",
		MonthlyAILimit: 300,
		MaxProjects:    100,
		MaxFavorites:   100,
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
