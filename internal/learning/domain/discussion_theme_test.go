package domain

import (
	"testing"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/stretchr/testify/assert"
)

func TestNewDiscussionTheme(t *testing.T) {
	tests := []struct {
		name    string
		value   string
		wantErr error
	}{
		{
			name:    "255文字以内の場合は作成できること",
			value:   "a",
			wantErr: nil,
		},
		{
			name:    "255文字ちょうどの場合は作成できること",
			value:   string(make([]rune, 255)),
			wantErr: nil,
		},
		{
			name:    "256文字以上の場合はエラーを返すこと",
			value:   string(make([]rune, 256)),
			wantErr: apperr.ErrInvalidRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewDiscussionTheme(tt.value)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.value, got.String())
		})
	}
}
