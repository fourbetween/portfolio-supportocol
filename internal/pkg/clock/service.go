package clock

//go:generate go tool mockgen -package clock -destination ./service_mock.go . Service

import "time"

type (
	Service interface {
		Now() time.Time
	}

	RealService struct{}
)

func NewRealService() Service {
	return &RealService{}
}

func (s *RealService) Now() time.Time {
	return time.Now()
}
