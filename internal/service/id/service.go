package id

//go:generate go tool mockgen -package id -destination ./service_mock.go . Service

import (
	"github.com/oklog/ulid/v2"
)

type (
	Service interface {
		Generate() string
	}

	ULIDService struct{}
)

func NewULIDService() *ULIDService {
	return &ULIDService{}
}

func (s *ULIDService) Generate() string {
	return ulid.Make().String()
}
