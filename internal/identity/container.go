package identity

import (
	"database/sql"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/fourbetween/app-supportocol/internal/identity/domain"
	"github.com/fourbetween/app-supportocol/internal/identity/infra/db"
	"github.com/fourbetween/app-supportocol/internal/identity/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-auth/mail"
	"github.com/fourbetween/pkg-auth/password"
	"github.com/fourbetween/pkg-conf/conf"
)

type Container struct {
	LoginWithGoogle   *usecase.LoginWithGoogleUsecase
	SignupWithEmail   *usecase.SignupWithEmailUsecase
	LoginWithEmail    *usecase.LoginWithEmailUsecase
	VerifyEmail       *usecase.VerifyEmailUsecase
	ResendVerifyEmail *usecase.ResendVerifyEmailUsecase
	GetUser           *usecase.GetUserUsecase
	DeleteUser        *usecase.DeleteUserUsecase
}

func NewContainer(
	dbCon *sql.DB,
	appConf conf.Service,
	jwtSrv jwt.Service,
	awscfg aws.Config,
	userCreatedHandler usecase.UserCreatedHandler,
	userDeletedHandler usecase.UserDeletedHandler,
) (*Container, error) {
	googleClientID, err := appConf.Get("google/client/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get Google client ID from config: %w", err)
	}

	sesFrom, err := appConf.Get("ses/from")
	if err != nil {
		return nil, fmt.Errorf("failed to get SES from address from config: %w", err)
	}

	siteDomain, err := appConf.Get("domain")
	if err != nil {
		return nil, fmt.Errorf("failed to get domain from config: %w", err)
	}

	userFac := domain.NewFactory()
	userRepo := db.NewUserRepository(dbCon, userFac)
	txManager := dbtx.NewManager(dbCon)

	buildUser := func(p auth.BuildParams) *domain.User {
		return userFac.Reconstruct(domain.ReconstructParams{
			ID:                          p.ID,
			Email:                       p.Email,
			Name:                        p.Name,
			PasswordHash:                p.PasswordHash,
			GoogleSub:                   p.GoogleSub,
			EmailVerifiedAt:             p.EmailVerifiedAt,
			EmailVerifyTokenHash:        p.EmailVerifyTokenHash,
			EmailVerifyTokenExpiresAt:   p.EmailVerifyTokenExpiresAt,
			PasswordResetTokenHash:      p.PasswordResetTokenHash,
			PasswordResetTokenExpiresAt: p.PasswordResetTokenExpiresAt,
		})
	}

	mailSrv, err := mail.NewSESService(sesFrom, fmt.Sprintf("https://%s/identity", siteDomain), awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create mail service: %w", err)
	}

	authSrv := auth.NewDefaultService(
		password.NewDefaultService(),
		mailSrv,
		userRepo,
		buildUser,
		googleClientID,
	)

	return &Container{
		LoginWithGoogle:   usecase.NewLoginWithGoogleUsecase(authSrv, jwtSrv, userCreatedHandler, txManager),
		SignupWithEmail:   usecase.NewSignupWithEmailUsecase(authSrv, userCreatedHandler, txManager),
		LoginWithEmail:    usecase.NewLoginWithEmailUsecase(authSrv, jwtSrv),
		VerifyEmail:       usecase.NewVerifyEmailUsecase(authSrv, userRepo, jwtSrv),
		ResendVerifyEmail: usecase.NewResendVerifyEmailUsecase(authSrv),
		GetUser:           usecase.NewGetUserUsecase(userRepo),
		DeleteUser:        usecase.NewDeleteUserUsecase(userRepo, userDeletedHandler, txManager),
	}, nil
}
