package domain

import (
	"errors"
	"testing"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
)

func TestCommentFrame_Validate(t *testing.T) {
	tests := []struct {
		name    string
		cf      CommentFrame
		wantErr error
	}{
		{
			name: "空文字の親コメントがRootとして許容されること",
			cf: CommentFrame{
				Types: []string{"質問", "回答"},
				Paths: []CommentPath{
					{Child: "質問", Parent: ""},
					{Child: "回答", Parent: "質問"},
				},
			},
			wantErr: nil,
		},
		{
			name: "親コメントの種類がTypesに含まれていれば成功すること",
			cf: CommentFrame{
				Types: []string{"質問", "回答"},
				Paths: []CommentPath{
					{Child: "回答", Parent: "質問"},
				},
			},
			wantErr: nil,
		},
		{
			name: "Typesが空ならエラーになること",
			cf: CommentFrame{
				Types: []string{},
				Paths: []CommentPath{},
			},
			wantErr: apperr.ErrInvalidArgument,
		},
		{
			name: "Typesに重複があればエラーになること",
			cf: CommentFrame{
				Types: []string{"質問", "質問"},
				Paths: []CommentPath{},
			},
			wantErr: apperr.ErrInvalidArgument,
		},
		{
			name: "子コメントの種類がTypesになければエラーになること",
			cf: CommentFrame{
				Types: []string{"質問"},
				Paths: []CommentPath{
					{Child: "存在しない種類", Parent: "質問"},
				},
			},
			wantErr: apperr.ErrInvalidArgument,
		},
		{
			name: "親コメントの種類（空文字以外）がTypesになければエラーになること",
			cf: CommentFrame{
				Types: []string{"回答"},
				Paths: []CommentPath{
					{Child: "回答", Parent: "質問"},
				},
			},
			wantErr: apperr.ErrInvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.cf.Validate()
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("CommentFrame.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDialogueSettings_Validate(t *testing.T) {
	tests := []struct {
		name    string
		s       DialogueSettings
		wantErr error
	}{
		{
			name: "正常な設定なら成功すること",
			s: DialogueSettings{
				CommentFrame: CommentFrame{
					Types: []string{"質問"},
					Paths: []CommentPath{{Child: "質問", Parent: ""}},
				},
			},
			wantErr: nil,
		},
		{
			name: "CommentFrameのバリデーションエラーが返ること",
			s: DialogueSettings{
				CommentFrame: CommentFrame{
					Types: []string{},
				},
			},
			wantErr: apperr.ErrInvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.s.Validate()
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("DialogueSettings.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
