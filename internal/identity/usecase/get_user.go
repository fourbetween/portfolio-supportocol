package usecase

import (
	"context"

	"github.com/fourbetween/app-supportocol/internal/identity/domain"
)

type GetUserUsecase struct {
	userRepo domain.Repository
}

func NewGetUserUsecase(userRepo domain.Repository) *GetUserUsecase {
	return &GetUserUsecase{
		userRepo: userRepo,
	}
}

func (u *GetUserUsecase) Execute(ctx context.Context, id string) (*domain.User, error) {
	return u.userRepo.FindByID(ctx, id)
}
