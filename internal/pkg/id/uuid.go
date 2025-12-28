package id

//go:generate go tool mockgen -package id -destination ./service_mock.go . Service

import (
	"github.com/google/uuid"
)

type UUIDService struct{}

func NewUUIDService() *UUIDService {
	return &UUIDService{}
}

func (s *UUIDService) Generate() string {
	id, err := uuid.NewV7()
	if err != nil {
		panic(err)
	}
	return id.String()
}
