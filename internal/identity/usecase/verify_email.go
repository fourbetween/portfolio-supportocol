package usecase

import (
	"context"
	"crypto/sha256"
	"encoding/hex"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
)

type VerifyEmailUsecase struct {
	authSrv  auth.Service[*domain.User]
	userRepo auth.Repository[*domain.User]
	jwtSrv   jwt.Service
}

func NewVerifyEmailUsecase(
	authSrv auth.Service[*domain.User],
	userRepo auth.Repository[*domain.User],
	jwtSrv jwt.Service,
) *VerifyEmailUsecase {
	return &VerifyEmailUsecase{
		authSrv:  authSrv,
		userRepo: userRepo,
		jwtSrv:   jwtSrv,
	}
}

func (u *VerifyEmailUsecase) Execute(ctx context.Context, token string) (string, error) {
	hash := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(hash[:])

	user, err := u.userRepo.FindByEmailVerifyTokenHash(ctx, tokenHash)
	if err != nil {
		return "", err
	}

	if err := u.authSrv.VerifyEmail(ctx, token); err != nil {
		return "", err
	}

	jwtToken, err := u.jwtSrv.Generate(user.ID())
	if err != nil {
		return "", err
	}

	return jwtToken, nil
}
