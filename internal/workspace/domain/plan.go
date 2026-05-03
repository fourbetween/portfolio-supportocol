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
	MaxProjects    int
	MaxFavorites   int
}

const (
	PlanIDFree     = "4c4ca77d-4a51-463e-9345-da27010cb450"
	PlanIDStandard = "cbe0d635-c20c-4c06-9933-1979fac9f5af"
)

func (p Plan) IsFree() bool {
	return p.ID == PlanIDFree
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
	if p.MaxProjects < 0 {
		return fmt.Errorf("max projects must be non-negative: %w", apperr.ErrInvalidArgument)
	}
	if p.MaxFavorites < 0 {
		return fmt.Errorf("max favorites must be non-negative: %w", apperr.ErrInvalidArgument)
	}
	return nil
}
