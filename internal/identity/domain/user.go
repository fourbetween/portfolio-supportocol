package domain

import (
	"context"
	"time"
)

type (
	Repository interface {
		Save(ctx context.Context, u *User) error
		FindByID(ctx context.Context, id string) (*User, error)
		FindByEmail(ctx context.Context, email string) (*User, error)
		FindByGoogleSub(ctx context.Context, googleSub string) (*User, error)
		FindByEmailVerifyTokenHash(ctx context.Context, tokenHash string) (*User, error)
		FindByPasswordResetTokenHash(ctx context.Context, tokenHash string) (*User, error)
	}

	LoadParams struct {
		ID string
	}

	SearchParams struct {
		Email     string
		GoogleSub string
	}
)

type (
	Factory struct{}

	ReconstructParams struct {
		ID                          string
		Email                       string
		Name                        string
		PasswordHash                string
		GoogleSub                   string
		EmailVerifiedAt             *time.Time
		EmailVerifyTokenHash        string
		EmailVerifyTokenExpiresAt   *time.Time
		PasswordResetTokenHash      string
		PasswordResetTokenExpiresAt *time.Time
	}
)

func NewFactory() *Factory {
	return &Factory{}
}

func (f *Factory) Reconstruct(params ReconstructParams) *User {
	return &User{
		id:                          params.ID,
		email:                       params.Email,
		name:                        params.Name,
		passwordHash:                params.PasswordHash,
		googleSub:                   params.GoogleSub,
		emailVerifiedAt:             params.EmailVerifiedAt,
		emailVerifyTokenHash:        params.EmailVerifyTokenHash,
		emailVerifyTokenExpiresAt:   params.EmailVerifyTokenExpiresAt,
		passwordResetTokenHash:      params.PasswordResetTokenHash,
		passwordResetTokenExpiresAt: params.PasswordResetTokenExpiresAt,
	}
}

type User struct {
	id                          string
	email                       string
	name                        string
	passwordHash                string
	googleSub                   string
	emailVerifiedAt             *time.Time
	emailVerifyTokenHash        string
	emailVerifyTokenExpiresAt   *time.Time
	passwordResetTokenHash      string
	passwordResetTokenExpiresAt *time.Time
}

func (u *User) ID() string {
	return u.id
}

func (u *User) Email() string {
	return u.email
}

func (u *User) Name() string {
	return u.name
}

func (u *User) PasswordHash() string {
	return u.passwordHash
}

func (u *User) GoogleSub() string {
	return u.googleSub
}

func (u *User) EmailVerifiedAt() *time.Time {
	return u.emailVerifiedAt
}

func (u *User) IsEmailVerified() bool {
	return u.emailVerifiedAt != nil
}

func (u *User) EmailVerifyTokenHash() string {
	return u.emailVerifyTokenHash
}

func (u *User) EmailVerifyTokenExpiresAt() *time.Time {
	return u.emailVerifyTokenExpiresAt
}

func (u *User) PasswordResetTokenHash() string {
	return u.passwordResetTokenHash
}

func (u *User) PasswordResetTokenExpiresAt() *time.Time {
	return u.passwordResetTokenExpiresAt
}

func (u *User) HasPassword() bool {
	return u.passwordHash != ""
}

func (u *User) HasGoogleAuth() bool {
	return u.googleSub != ""
}
