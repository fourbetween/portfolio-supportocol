package db

func ptrToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
