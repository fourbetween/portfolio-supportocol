package usecase

import "context"

type UserCreatedHandler interface {
	OnUserCreated(ctx context.Context, userID string) error
}
