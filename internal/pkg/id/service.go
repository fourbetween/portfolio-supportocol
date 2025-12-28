package id

//go:generate go tool mockgen -package id -destination ./service_mock.go . Service

type Service interface {
	Generate() string
}
