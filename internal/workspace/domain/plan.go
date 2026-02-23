package domain

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type (
	PlanRepository interface {
		Load(ctx context.Context, id string) (Plan, error)
		LoadDefault(ctx context.Context) (Plan, error)
		Save(ctx context.Context, plan Plan) error
	}
)

type Plan struct {
	ID             string
	Name           string
	Description    string
	MonthlyAILimit int
}

func (p Plan) Validate() error {
	if p.ID == "" {
		return fmt.Errorf("plan id is required: %w", apperr.ErrInvalidArgument)
	}
	if p.Name == "" {
		return fmt.Errorf("plan name is required: %w", apperr.ErrInvalidArgument)
	}
	if p.MonthlyAILimit < 0 {
		return fmt.Errorf("monthly AI limit must be non-negative: %w", apperr.ErrInvalidArgument)
	}
	return nil
}
