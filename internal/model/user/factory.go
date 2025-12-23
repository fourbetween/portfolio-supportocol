package user

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
)

type Factory struct {
	projectRepo    project.Repository
	ruleRepo       rule.Repository
	discussionRepo discussion.Repository
	projectFac     *project.Factory
	ruleFac        *rule.Factory
	discussionFac  *discussion.Factory
	clockSrv       clock.Service
}

func NewFactory(
	projectRepo project.Repository,
	ruleRepo rule.Repository,
	discussionRepo discussion.Repository,
	projectFac *project.Factory,
	ruleFac *rule.Factory,
	discussionFac *discussion.Factory,
	clockSrv clock.Service,
) *Factory {
	return &Factory{
		projectRepo:    projectRepo,
		ruleRepo:       ruleRepo,
		discussionRepo: discussionRepo,
		projectFac:     projectFac,
		ruleFac:        ruleFac,
		discussionFac:  discussionFac,
		clockSrv:       clockSrv,
	}
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

		projectRepo:    f.projectRepo,
		ruleRepo:       f.ruleRepo,
		discussionRepo: f.discussionRepo,
		projectFac:     f.projectFac,
		ruleFac:        f.ruleFac,
		discussionFac:  f.discussionFac,
		clockSrv:       f.clockSrv,
	}
}
