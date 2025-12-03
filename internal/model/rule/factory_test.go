package rule_test

import (
	"slices"
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/service/id"
	gomock "go.uber.org/mock/gomock"
)

func TestFactory_NewRule(t *testing.T) {
	tests := []struct {
		name    string
		params  rule.NewRuleParams
		wantErr bool
	}{
		{
			name: "矛盾がないルールを作成できること",
			params: rule.NewRuleParams{
				Name:        "test-rule",
				Description: "test-description",
				CreatedBy:   "test-user",
				CreatedAt:   time.Now(),
				CommentTypes: []rule.CommentType{
					{ID: "ct1", No: 1, Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
					{ID: "ct2", No: 2, Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
				},
				CommentTypePaths: []rule.CommentTypePath{
					{ChildCommentTypeID: "ct1", ParentCommentTypeID: "ct2"},
				},
			},
			wantErr: false,
		},
		{
			name: "FromCommentTypeIDが存在しない場合はエラーを返すこと",
			params: rule.NewRuleParams{
				Name:        "test-rule",
				Description: "test-description",
				CreatedBy:   "test-user",
				CreatedAt:   time.Now(),
				CommentTypes: []rule.CommentType{
					{ID: "ct1", No: 1, Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				},
				CommentTypePaths: []rule.CommentTypePath{
					{ChildCommentTypeID: "ct999", ParentCommentTypeID: "ct1"},
				},
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			idSrv := id.NewULIDService()
			ruleRepo := rule.NewMockRepository(ctrl)
			ruleFac := rule.NewFactory(ruleRepo, idSrv)

			r, err := ruleFac.NewRule(tt.params)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewRule() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && r == nil {
				t.Errorf("NewRule() returned nil, want non-nil")
			}
		})
	}
}

func TestFactory_NewDefaultRule(t *testing.T) {
	fixedTime := time.Date(2025, 11, 18, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name   string
		setup  func(*id.MockService)
		verify func(*testing.T, *rule.Rule, error)
	}{
		{
			name: "汎用ルールが作成できること",
			setup: func(idSrv *id.MockService) {
				// 6つのコメント種類IDを生成、その後ルールIDを生成
				idSrv.EXPECT().Generate().Return("ct-problem")
				idSrv.EXPECT().Generate().Return("ct-solution")
				idSrv.EXPECT().Generate().Return("ct-agree")
				idSrv.EXPECT().Generate().Return("ct-disagree")
				idSrv.EXPECT().Generate().Return("ct-question")
				idSrv.EXPECT().Generate().Return("ct-answer")
				idSrv.EXPECT().Generate().Return("rule-id")
			},
			verify: func(t *testing.T, got *rule.Rule, err error) {
				t.Helper()
				if err != nil {
					t.Errorf("NewDefaultRule() error = %v", err)
					return
				}
				if got == nil {
					t.Error("NewDefaultRule() returned nil")
					return
				}
				if got.ID() != "rule-id" {
					t.Errorf("NewDefaultRule().ID() = %v, want rule-id", got.ID())
				}
				if got.Name() != "汎用ルール" {
					t.Errorf("NewDefaultRule().Name() = %v, want 汎用ルール", got.Name())
				}

				// コメント種類の検証
				commentTypes := got.CommentTypes()
				expectedTypeNames := []string{"問題", "対応", "賛成", "反対", "質問", "回答"}
				if len(commentTypes) != len(expectedTypeNames) {
					t.Errorf("CommentTypes length = %v, want %v", len(commentTypes), len(expectedTypeNames))
					return
				}
				for i, expectedName := range expectedTypeNames {
					if commentTypes[i].Name != expectedName {
						t.Errorf("CommentTypes[%d].Name = %v, want %v", i, commentTypes[i].Name, expectedName)
					}
				}

				// ルートコメントタイプの検証
				rootTypes := []string{"問題", "質問"}
				for _, ct := range commentTypes {
					isRoot := slices.Contains(rootTypes, ct.Name)
					if ct.Root != isRoot {
						t.Errorf("CommentType %q.Root = %v, want %v", ct.Name, ct.Root, isRoot)
					}
				}

				// 経路の検証
				paths := got.CommentTypePaths()
				expectedPathCount := 17
				if len(paths) != expectedPathCount {
					t.Errorf("CommentTypePaths length = %v, want %v", len(paths), expectedPathCount)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			idSrv := id.NewMockService(ctrl)
			ruleRepo := rule.NewMockRepository(ctrl)
			ruleFac := rule.NewFactory(ruleRepo, idSrv)

			if tt.setup != nil {
				tt.setup(idSrv)
			}

			got, err := ruleFac.NewDefaultRule(rule.NewDefaultRuleParams{
				CreatedBy: "test-user-id",
				CreatedAt: fixedTime,
			})

			if tt.verify != nil {
				tt.verify(t, got, err)
			}
		})
	}
}
