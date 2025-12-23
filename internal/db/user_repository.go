package db

import (
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	auth "github.com/fourbetween/pkg-auth"
	"github.com/go-jet/jet/v2/mysql"
	"github.com/go-jet/jet/v2/qrm"
)

type (
	UserRepository struct {
		db  qrm.DB
		fac *user.Factory
	}
)

func NewUserRepository(
	db qrm.DB,
) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) SetFactory(fac *user.Factory) {
	r.fac = fac
}

func (r *UserRepository) Save(u *user.User) error {
	userRecord := model.Users{
		ID:                          u.ID(),
		Email:                       u.Email(),
		Name:                        u.Name(),
		PasswordHash:                stringToPtr(u.PasswordHash()),
		GoogleSub:                   stringToPtr(u.GoogleSub()),
		EmailVerifiedAt:             u.EmailVerifiedAt(),
		EmailVerifyTokenHash:        stringToPtr(u.EmailVerifyTokenHash()),
		EmailVerifyTokenExpiresAt:   u.EmailVerifyTokenExpiresAt(),
		PasswordResetTokenHash:      stringToPtr(u.PasswordResetTokenHash()),
		PasswordResetTokenExpiresAt: u.PasswordResetTokenExpiresAt(),
	}

	userStmt := table.Users.
		INSERT(
			table.Users.AllColumns.Except(
				table.Users.CreatedAt,
				table.Users.UpdatedAt,
			),
		).
		MODEL(userRecord).
		AS_NEW().
		ON_DUPLICATE_KEY_UPDATE(
			table.Users.Name.SET(table.Users.NEW.Name),
			table.Users.Email.SET(table.Users.NEW.Email),
			table.Users.PasswordHash.SET(table.Users.NEW.PasswordHash),
			table.Users.GoogleSub.SET(table.Users.NEW.GoogleSub),
			table.Users.EmailVerifiedAt.SET(table.Users.NEW.EmailVerifiedAt),
			table.Users.EmailVerifyTokenHash.SET(table.Users.NEW.EmailVerifyTokenHash),
			table.Users.EmailVerifyTokenExpiresAt.SET(table.Users.NEW.EmailVerifyTokenExpiresAt),
			table.Users.PasswordResetTokenHash.SET(table.Users.NEW.PasswordResetTokenHash),
			table.Users.PasswordResetTokenExpiresAt.SET(table.Users.NEW.PasswordResetTokenExpiresAt),
		)

	if _, err := userStmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save user: %w", err)
	}

	return nil
}

func (r *UserRepository) FindByID(id string) (*user.User, error) {
	cond := table.Users.ID.EQ(mysql.String(id))
	return r.findByCondition(cond)
}

func (r *UserRepository) FindByEmail(email string) (*user.User, error) {
	cond := table.Users.Email.EQ(mysql.String(email))
	return r.findByCondition(cond)
}

func (r *UserRepository) FindByGoogleSub(googleSub string) (*user.User, error) {
	cond := table.Users.GoogleSub.EQ(mysql.String(googleSub))
	return r.findByCondition(cond)
}

func (r *UserRepository) FindByEmailVerifyTokenHash(tokenHash string) (*user.User, error) {
	cond := table.Users.EmailVerifyTokenHash.EQ(mysql.String(tokenHash))
	return r.findByCondition(cond)
}

func (r *UserRepository) FindByPasswordResetTokenHash(tokenHash string) (*user.User, error) {
	cond := table.Users.PasswordResetTokenHash.EQ(mysql.String(tokenHash))
	return r.findByCondition(cond)
}

func (r *UserRepository) findByCondition(cond mysql.BoolExpression) (*user.User, error) {
	stmt := mysql.
		SELECT(table.Users.AllColumns).
		FROM(table.Users).
		WHERE(cond)

	var dest model.Users
	if err := stmt.Query(r.db, &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, fmt.Errorf("user not found: %w: %w", internal.ErrNotFound, auth.ErrNotFound)
		}
		return nil, fmt.Errorf("failed to query user: %w", err)
	}

	return r.fac.Build(user.BuildParams{
		ID:                          dest.ID,
		Email:                       dest.Email,
		Name:                        dest.Name,
		PasswordHash:                ptrToString(dest.PasswordHash),
		GoogleSub:                   ptrToString(dest.GoogleSub),
		EmailVerifiedAt:             dest.EmailVerifiedAt,
		EmailVerifyTokenHash:        ptrToString(dest.EmailVerifyTokenHash),
		EmailVerifyTokenExpiresAt:   dest.EmailVerifyTokenExpiresAt,
		PasswordResetTokenHash:      ptrToString(dest.PasswordResetTokenHash),
		PasswordResetTokenExpiresAt: dest.PasswordResetTokenExpiresAt,
	}), nil
}
