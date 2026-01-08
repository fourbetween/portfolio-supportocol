package domain

import (
	"testing"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/stretchr/testify/assert"
)

func TestComment_UpdateStatus(t *testing.T) {
	tests := []struct {
		name          string
		currentStatus CommentStatus
		status        CommentStatus
		wantErr       error
	}{
		{
			name:          "有効なステータス（active）に更新できること",
			currentStatus: CommentStatusProposed,
			status:        CommentStatusActive,
			wantErr:       nil,
		},
		{
			name:          "有効なステータス（proposed）に更新できること",
			currentStatus: "",
			status:        CommentStatusProposed,
			wantErr:       nil,
		},
		{
			name:          "activeからproposedには変更できないこと",
			currentStatus: CommentStatusActive,
			status:        CommentStatusProposed,
			wantErr:       apperr.ErrInvalidArgument,
		},
		{
			name:          "無効なステータスの場合にエラーを返すこと",
			currentStatus: CommentStatusProposed,
			status:        CommentStatus("invalid"),
			wantErr:       apperr.ErrInvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &Comment{status: tt.currentStatus}
			err := c.UpdateStatus(tt.status)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.status, c.Status())
		})
	}
}

func TestComment_Update(t *testing.T) {
	tests := []struct {
		name    string
		content string
		wantErr error
	}{
		{
			name:    "更新できること",
			content: "a",
			wantErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &Comment{}
			err := c.Update(UpdateCommentParams{
				CommentType: "test",
				Content:     tt.content,
			})
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.content, c.Content())
		})
	}
}
