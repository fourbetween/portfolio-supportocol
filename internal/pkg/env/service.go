package env

import "os"

func AppName() string {
	return os.Getenv("APP_NAME")
}

func IsDev() bool {
	return os.Getenv("STAGE") == "dev"
}
