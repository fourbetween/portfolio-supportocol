package rule_test

import (
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
					{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
					{ID: "ct2", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
				},
				CommentTypePaths: []rule.CommentTypePath{
					{FromCommentTypeID: "ct1", ToCommentTypeID: "ct2"},
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
					{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				},
				CommentTypePaths: []rule.CommentTypePath{
					{FromCommentTypeID: "ct999", ToCommentTypeID: "ct1"},
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
