package domain

import (
	"time"
)

type Factory struct{}

func NewFactory() *Factory {
	return &Factory{}
}

type BuildParams struct {
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

func (f *Factory) Build(params BuildParams) *User {
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
