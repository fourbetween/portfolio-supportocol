package domain

import "context"

type Repository interface {
	Save(ctx context.Context, u *User) error
	FindByID(ctx context.Context, id string) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByGoogleSub(ctx context.Context, googleSub string) (*User, error)
	FindByEmailVerifyTokenHash(ctx context.Context, tokenHash string) (*User, error)
	FindByPasswordResetTokenHash(ctx context.Context, tokenHash string) (*User, error)
}

type LoadParams struct {
	ID string
}

type SearchParams struct {
	Email     string
	GoogleSub string
}
