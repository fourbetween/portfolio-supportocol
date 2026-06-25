package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/identity/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/identity/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/go-jet/jet/v2/mysql"
	"github.com/go-jet/jet/v2/qrm"
)

type (
	UserRepository struct {
		db  *sql.DB
		fac *domain.Factory
	}
)

func NewUserRepository(
	db *sql.DB,
	fac *domain.Factory,
) *UserRepository {
	return &UserRepository{db: db, fac: fac}
}

func (r *UserRepository) Create(ctx context.Context, u *domain.User) error {
	userRecord := model.Users{
		ID:                          u.ID(),
		Email:                       u.Email(),
		Name:                        u.Name(),
		PasswordHash:                strToPtr(u.PasswordHash()),
		GoogleSub:                   strToPtr(u.GoogleSub()),
		EmailVerifiedAt:             timeToPtr(u.EmailVerifiedAt()),
		EmailVerifyTokenHash:        strToPtr(u.EmailVerifyTokenHash()),
		EmailVerifyTokenExpiresAt:   timeToPtr(u.EmailVerifyTokenExpiresAt()),
		PasswordResetTokenHash:      strToPtr(u.PasswordResetTokenHash()),
		PasswordResetTokenExpiresAt: timeToPtr(u.PasswordResetTokenExpiresAt()),
	}

	userStmt := table.Users.
		INSERT(
			table.Users.AllColumns.Except(
				table.Users.CreatedAt,
				table.Users.UpdatedAt,
			),
		).
		MODEL(userRecord)

	if _, err := userStmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) Update(ctx context.Context, u *domain.User) error {
	userRecord := model.Users{
		ID:                          u.ID(),
		Email:                       u.Email(),
		Name:                        u.Name(),
		PasswordHash:                strToPtr(u.PasswordHash()),
		GoogleSub:                   strToPtr(u.GoogleSub()),
		EmailVerifiedAt:             timeToPtr(u.EmailVerifiedAt()),
		EmailVerifyTokenHash:        strToPtr(u.EmailVerifyTokenHash()),
		EmailVerifyTokenExpiresAt:   timeToPtr(u.EmailVerifyTokenExpiresAt()),
		PasswordResetTokenHash:      strToPtr(u.PasswordResetTokenHash()),
		PasswordResetTokenExpiresAt: timeToPtr(u.PasswordResetTokenExpiresAt()),
	}
	stmt := table.Users.
		UPDATE(
			table.Users.Name,
			table.Users.Email,
			table.Users.PasswordHash,
			table.Users.GoogleSub,
			table.Users.EmailVerifiedAt,
			table.Users.EmailVerifyTokenHash,
			table.Users.EmailVerifyTokenExpiresAt,
			table.Users.PasswordResetTokenHash,
			table.Users.PasswordResetTokenExpiresAt,
		).
		MODEL(userRecord).
		WHERE(table.Users.ID.EQ(mysql.String(u.ID())))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	stmt := table.Users.
		DELETE().
		WHERE(table.Users.ID.EQ(mysql.String(id)))

	if _, err := stmt.Exec(dbtx.GetExecutor(ctx, r.db)); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	cond := table.Users.ID.EQ(mysql.String(id))
	return r.findByCondition(ctx, cond)
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	cond := table.Users.Email.EQ(mysql.String(email))
	return r.findByCondition(ctx, cond)
}

func (r *UserRepository) FindByGoogleSub(ctx context.Context, googleSub string) (*domain.User, error) {
	cond := table.Users.GoogleSub.EQ(mysql.String(googleSub))
	return r.findByCondition(ctx, cond)
}

func (r *UserRepository) FindByEmailVerifyTokenHash(ctx context.Context, tokenHash string) (*domain.User, error) {
	cond := table.Users.EmailVerifyTokenHash.EQ(mysql.String(tokenHash))
	return r.findByCondition(ctx, cond)
}

func (r *UserRepository) FindByPasswordResetTokenHash(ctx context.Context, tokenHash string) (*domain.User, error) {
	cond := table.Users.PasswordResetTokenHash.EQ(mysql.String(tokenHash))
	return r.findByCondition(ctx, cond)
}

func (r *UserRepository) findByCondition(ctx context.Context, cond mysql.BoolExpression) (*domain.User, error) {
	stmt := mysql.
		SELECT(table.Users.AllColumns).
		FROM(table.Users).
		WHERE(cond)

	var dest model.Users
	if err := stmt.Query(dbtx.GetExecutor(ctx, r.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, fmt.Errorf("user not found: %w: %w", apperr.ErrNotFound, auth.ErrNotFound)
		}
		return nil, fmt.Errorf("failed to query user: %w", err)
	}

	return r.fac.Reconstruct(domain.ReconstructParams{
		ID:                          dest.ID,
		Email:                       dest.Email,
		Name:                        dest.Name,
		PasswordHash:                ptrToString(dest.PasswordHash),
		GoogleSub:                   ptrToString(dest.GoogleSub),
		EmailVerifiedAt:             ptrToTime(dest.EmailVerifiedAt),
		EmailVerifyTokenHash:        ptrToString(dest.EmailVerifyTokenHash),
		EmailVerifyTokenExpiresAt:   ptrToTime(dest.EmailVerifyTokenExpiresAt),
		PasswordResetTokenHash:      ptrToString(dest.PasswordResetTokenHash),
		PasswordResetTokenExpiresAt: ptrToTime(dest.PasswordResetTokenExpiresAt),
	}), nil
}
