package db

import "time"

func ptrToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func ptrToTime(t *time.Time) time.Time {
	if t == nil {
		return time.Time{}
	}
	return *t
}
