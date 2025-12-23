package user

type Repository interface {
	Save(u *User) error
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	FindByGoogleSub(googleSub string) (*User, error)
	FindByEmailVerifyTokenHash(tokenHash string) (*User, error)
	FindByPasswordResetTokenHash(tokenHash string) (*User, error)
}

type LoadParams struct {
	ID string
}

type SearchParams struct {
	Email     string
	GoogleSub string
}
