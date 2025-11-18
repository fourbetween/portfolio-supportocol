package clock_test

import (
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal/service/clock"
)

func TestRealService_Now(t *testing.T) {
	tests := []struct {
		name string
	}{
		{
			name: "現在時刻を取得できること",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			srv := clock.NewRealService()
			before := time.Now()
			got := srv.Now()
			after := time.Now()

			if got.Before(before) || got.After(after) {
				t.Errorf("Now() = %v, want between %v and %v", got, before, after)
			}
		})
	}
}
