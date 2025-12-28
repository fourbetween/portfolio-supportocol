package db

import (
	"github.com/go-jet/jet/v2/mysql"
)

func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func ptrToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// toMysqlStrings converts a slice of strings to mysql.Expression slice
func toMysqlStrings(strs []string) []mysql.Expression {
	result := make([]mysql.Expression, len(strs))
	for i, s := range strs {
		result[i] = mysql.String(s)
	}
	return result
}
