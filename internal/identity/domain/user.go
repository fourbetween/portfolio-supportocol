package domain

import (
	"time"
)

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
