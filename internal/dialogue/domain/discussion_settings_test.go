package domain

import (
	"errors"
	"testing"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

func TestCommentFrame_ValidateComment(t *testing.T) {
	cf := CommentFrame{
		Types: []string{"質問", "回答"},
		Paths: []CommentPath{
			{Child: "質問", Parent: ""},
			{Child: "回答", Parent: "質問"},
		},
	}

	tests := []struct {
		name        string
		commentType string
		parentType  *string
		wantErr     error
	}{
		{
			name:        "Rootコメント（Parentが空）として許可された種類なら成功すること",
			commentType: "質問",
			parentType:  nil,
			wantErr:     nil,
		},
		{
			name:        "許可された親子関係なら成功すること",
			commentType: "回答",
			parentType:  ptr("質問"),
			wantErr:     nil,
		},
		{
			name:        "Rootコメントとして許可されていない種類ならエラーになること",
			commentType: "回答",
			parentType:  nil,
			wantErr:     apperr.ErrInvalidArgument,
		},
		{
			name:        "許可されていない親子関係ならエラーになること",
			commentType: "質問",
			parentType:  ptr("回答"),
			wantErr:     apperr.ErrInvalidArgument,
		},
		{
			name:        "Typesに含まれていない種類ならエラーになること",
			commentType: "存在しない種類",
			parentType:  nil,
			wantErr:     apperr.ErrInvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := cf.ValidateComment(tt.commentType, tt.parentType)
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("CommentFrame.ValidateComment() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func ptr(s string) *string {
	return &s
}
