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

func TestPermissionLevel_Validate(t *testing.T) {
	tests := []struct {
		name    string
		level   PermissionLevel
		wantErr error
	}{
		{
			name:    "everyoneが有効であること",
			level:   PermissionEveryone,
			wantErr: nil,
		},
		{
			name:    "authenticatedが有効であること",
			level:   PermissionAuthenticated,
			wantErr: nil,
		},
		{
			name:    "noneが有効であること",
			level:   PermissionNone,
			wantErr: nil,
		},
		{
			name:    "不正な値ならエラーになること",
			level:   PermissionLevel("invalid"),
			wantErr: apperr.ErrInvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.level.Validate()
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("PermissionLevel.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestPermissionLevel_CanPerform(t *testing.T) {
	tests := []struct {
		name   string
		level  PermissionLevel
		userID string
		want   bool
	}{
		{
			name:   "everyoneなら未認証ユーザーも許可されること",
			level:  PermissionEveryone,
			userID: "",
			want:   true,
		},
		{
			name:   "everyoneなら認証ユーザーも許可されること",
			level:  PermissionEveryone,
			userID: "user-1",
			want:   true,
		},
		{
			name:   "authenticatedなら認証ユーザーが許可されること",
			level:  PermissionAuthenticated,
			userID: "user-1",
			want:   true,
		},
		{
			name:   "authenticatedなら未認証ユーザーが拒否されること",
			level:  PermissionAuthenticated,
			userID: "",
			want:   false,
		},
		{
			name:   "noneなら認証ユーザーも拒否されること",
			level:  PermissionNone,
			userID: "user-1",
			want:   false,
		},
		{
			name:   "noneなら未認証ユーザーも拒否されること",
			level:  PermissionNone,
			userID: "",
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.level.CanPerform(tt.userID)
			if got != tt.want {
				t.Errorf("PermissionLevel.CanPerform() = %v, want %v", got, tt.want)
			}
		})
	}
}
