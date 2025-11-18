package discussion

//go:generate mockgen -source=$GOFILE -destination=repository_mock.go -package=$GOPACKAGE

type (
	Repository interface {
	}
)
