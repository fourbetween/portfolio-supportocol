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

func timeToPtr(t time.Time) *time.Time {
	if t.IsZero() {
		return nil
	}
	return &t
}

func strToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
