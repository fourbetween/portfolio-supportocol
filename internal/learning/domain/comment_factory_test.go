package domain

import (
	"fmt"
	"testing"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/clock"
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestCommentFactory_Create(t *testing.T) {
	idSrv := id.NewUUIDService()
	clockSrv := clock.NewRealService()
	f := NewCommentFactory(idSrv, clockSrv)

	tests := []struct {
		name    string
		content string
		wantErr error
	}{
		{
			name:    fmt.Sprintf("%d文字以内の場合は作成できること", MaxContentLength),
			content: "a",
			wantErr: nil,
		},
		{
			name:    fmt.Sprintf("%d文字以上の場合はエラーを返すこと", MaxContentLength+1),
			content: string(make([]rune, MaxContentLength+1)),
			wantErr: apperr.ErrInvalidRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			comment, err := f.Create(CreateCommentParams{
				DiscussionID: "disc-id",
				Content:      tt.content,
				Status:       CommentStatusActive,
			})

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				assert.Nil(t, comment)
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, comment)
			assert.Equal(t, tt.content, comment.Content())
		})
	}
}
