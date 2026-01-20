package domain

import (
	"errors"
	"testing"

	"github.com/google/go-cmp/cmp"

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

func TestCommentFrame_Sorted(t *testing.T) {
	tests := []struct {
		name string
		cf   CommentFrame
		want CommentFrame
	}{
		{
			name: "種類と経路がソートされること",
			cf: CommentFrame{
				Types: []string{"B", "A", "C"},
				Paths: []CommentPath{
					{Child: "B", Parent: "A"}, // Parent: A
					{Child: "A", Parent: ""},  // Parent: "" (一番最初)
					{Child: "C", Parent: "B"}, // Parent: B
				},
			},
			want: CommentFrame{
				Types: []string{"A", "B", "C"},
				Paths: []CommentPath{
					{Child: "A", Parent: ""},
					{Child: "B", Parent: "A"},
					{Child: "C", Parent: "B"},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// コピーを取っておく
			origTypes := append([]string{}, tt.cf.Types...)
			origPaths := append([]CommentPath{}, tt.cf.Paths...)

			got := tt.cf.Sorted()

			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("Sorted() mismatch (-want +got):\n%s", diff)
			}

			// 元のオブジェクトが変更されていないことの確認
			if diff := cmp.Diff(origTypes, tt.cf.Types); diff != "" {
				t.Errorf("Sorted() modified original Types (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(origPaths, tt.cf.Paths); diff != "" {
				t.Errorf("Sorted() modified original Paths (-want +got):\n%s", diff)
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
