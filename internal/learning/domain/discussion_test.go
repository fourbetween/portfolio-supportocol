package domain

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestDiscussion_EnsureCommentFrameRequirement(t *testing.T) {
	tests := []struct {
		name        string
		status      DiscussionStatus
		initialCF   *CommentFrame
		commentType string
		parentType  string
		wantCF      *CommentFrame
	}{
		{
			name:        "非公開の議論なら何もしないこと",
			status:      DiscussionStatusPrivate,
			initialCF:   nil,
			commentType: "質問",
			parentType:  "",
			wantCF:      nil,
		},
		{
			name:   "公開済みの議論に新しいタイプとパスが追加されること",
			status: DiscussionStatusPublic,
			initialCF: &CommentFrame{
				Types: []string{"既存"},
				Paths: []CommentPath{
					{Child: "既存", Parent: ""},
				},
			},
			commentType: "新規",
			parentType:  "既存",
			wantCF: &CommentFrame{
				Types: []string{"新規", "既存"},
				Paths: []CommentPath{
					{Child: "既存", Parent: ""},
					{Child: "新規", Parent: "既存"},
				},
			},
		},
		{
			name:   "内部公開済みの議論に新しいタイプとパスが追加されること",
			status: DiscussionStatusInternal,
			initialCF: &CommentFrame{
				Types: []string{"既存"},
				Paths: []CommentPath{
					{Child: "既存", Parent: ""},
				},
			},
			commentType: "新規",
			parentType:  "既存",
			wantCF: &CommentFrame{
				Types: []string{"新規", "既存"},
				Paths: []CommentPath{
					{Child: "既存", Parent: ""},
					{Child: "新規", Parent: "既存"},
				},
			},
		},
		{
			name:   "既にあるなら追加されないこと",
			status: DiscussionStatusPublic,
			initialCF: &CommentFrame{
				Types: []string{"既存"},
				Paths: []CommentPath{
					{Child: "既存", Parent: ""},
				},
			},
			commentType: "既存",
			parentType:  "",
			wantCF: &CommentFrame{
				Types: []string{"既存"},
				Paths: []CommentPath{
					{Child: "既存", Parent: ""},
				},
			},
		},
		{
			name:   "タイプはあるがパスがない場合パスだけ追加されること",
			status: DiscussionStatusPublic,
			initialCF: &CommentFrame{
				Types: []string{"既存1", "既存2"},
				Paths: []CommentPath{
					{Child: "既存1", Parent: ""},
				},
			},
			commentType: "既存2",
			parentType:  "既存1",
			wantCF: &CommentFrame{
				Types: []string{"既存1", "既存2"},
				Paths: []CommentPath{
					{Child: "既存1", Parent: ""},
					{Child: "既存2", Parent: "既存1"},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			d := &Discussion{
				status: tt.status,
			}
			if tt.initialCF != nil {
				d.dialogueSettings = &DialogueSettings{
					CommentFrame: *tt.initialCF,
				}
			}

			d.EnsureCommentFrameRequirement(tt.commentType, tt.parentType)

			var gotCF *CommentFrame
			if d.dialogueSettings != nil {
				gotCF = &d.dialogueSettings.CommentFrame
			}

			if diff := cmp.Diff(tt.wantCF, gotCF, cmp.AllowUnexported(CommentFrame{}, CommentPath{})); diff != "" {
				t.Errorf("EnsureCommentFrameRequirement() mismatch (-want +got):\n%s", diff)
			}
		})
	}
}
