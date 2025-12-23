package api

import (
	"database/sql"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/db"
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
	auth "github.com/fourbetween/pkg-auth"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/fourbetween/pkg-auth/password"
	authuser "github.com/fourbetween/pkg-auth/user"
	conf "github.com/fourbetween/pkg-conf"
	id "github.com/fourbetween/pkg-id"
)

type (
	container struct {
		userRepo user.Repository
		authSrv  auth.Service[*user.User]
		jwtSrv   jwt.Service
	}

	containerFactory func(tx *sql.Tx) (*container, error)
)

func newContainerFactory(appConf conf.Service, jwtSrv jwt.Service) (containerFactory, error) {
	googleClientID, err := appConf.Get("google/client/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get Google client ID from config: %w", err)
	}

	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()
	passwordSrv := password.NewDefaultService()

	return func(tx *sql.Tx) (*container, error) {
		projectRepo := db.NewProjectRepository(tx)
		projectFac := project.NewFactory(
			projectRepo,
			idSrv,
		)
		projectRepo.SetFactory(projectFac)

		ruleRepo := db.NewRuleRepository(tx)
		ruleFac := rule.NewFactory(
			ruleRepo,
			idSrv,
		)
		ruleRepo.SetFactory(ruleFac)

		discussionRepo := db.NewDiscussionRepository(tx)
		discussionFac := discussion.NewFactory(
			discussionRepo,
			idSrv,
			clockSrv,
			ruleRepo,
		)
		discussionRepo.SetFactory(discussionFac)

		userFac := user.NewFactory(
			projectRepo,
			ruleRepo,
			discussionRepo,
			projectFac,
			ruleFac,
			discussionFac,
			clockSrv,
		)
		userRepo := db.NewUserRepository(tx)
		userRepo.SetFactory(userFac)

		buildUser := func(p authuser.BuildParams) *user.User {
			return userFac.Build(user.BuildParams{
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

		authSrv := auth.NewDefaultService(
			passwordSrv,
			nil,
			userRepo,
			buildUser,
			googleClientID,
		)

		return &container{
			userRepo: userRepo,
			authSrv:  authSrv,
			jwtSrv:   jwtSrv,
		}, nil
	}, nil
}
