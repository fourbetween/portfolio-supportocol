package usecase

import "context"

type UserDeletedHandler interface {
	OnUserDeleted(ctx context.Context, userID string) error
}
