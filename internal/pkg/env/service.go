package env

import "os"

func AppName() string {
	return os.Getenv("APP_NAME")
}

func IsDev() bool {
	return os.Getenv("STAGE") == "dev"
}

func IsLambda() bool {
	return os.Getenv("AWS_LAMBDA_FUNCTION_NAME") != ""
}
