package domain

import (
	"fmt"
	"time"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

type SubscriptionStatus string

const (
	SubscriptionStatusActive   SubscriptionStatus = "active"
	SubscriptionStatusCanceled SubscriptionStatus = "canceled"
	SubscriptionStatusPastDue  SubscriptionStatus = "past_due"
)

func (s SubscriptionStatus) String() string {
	return string(s)
}

func (s SubscriptionStatus) Validate() error {
	switch s {
	case SubscriptionStatusActive, SubscriptionStatusCanceled, SubscriptionStatusPastDue:
		return nil
	default:
		return fmt.Errorf("invalid subscription status %q: %w", s, apperr.ErrInvalidArgument)
	}
}

type Subscription struct {
	Plan                 Plan
	Status               SubscriptionStatus
	CurrentPeriodStart   time.Time
	CurrentPeriodEnd     time.Time
	StripeSubscriptionID *string
}

func (s Subscription) Validate() error {
	if err := s.Plan.Validate(); err != nil {
		return err
	}
	if err := s.Status.Validate(); err != nil {
		return err
	}
	if s.CurrentPeriodStart.IsZero() {
		return fmt.Errorf("subscription current period start is required: %w", apperr.ErrInvalidArgument)
	}
	if s.CurrentPeriodEnd.IsZero() {
		return fmt.Errorf("subscription current period end is required: %w", apperr.ErrInvalidArgument)
	}
	return nil
}

func (s Subscription) IsActive() bool {
	return s.Status == SubscriptionStatusActive
}
