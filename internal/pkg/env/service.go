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

func DevUserID() string {
	return "019c8fab-a62c-7203-8210-633df0a30bed"
}
