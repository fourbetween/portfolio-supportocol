package rule_test

import (
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/service/id"
	gomock "go.uber.org/mock/gomock"
)

type (
	container struct {
		RuleFac  *rule.Factory
		RuleRepo rule.Repository
	}
)

func newContainer(t *testing.T) *container {
	ctrl := gomock.NewController(t)

	idSrv := id.NewULIDService()
	ruleRepo := rule.NewMockRepository(ctrl)
	ruleFac := rule.NewFactory(
		ruleRepo,
		idSrv,
	)
	return &container{
		RuleFac:  ruleFac,
		RuleRepo: ruleRepo,
	}
}

func TestRule_Save(t *testing.T) {
	tests := []struct {
		name             string
		commentTypes     []rule.CommentType
		commentTypePaths []rule.CommentTypePath
		wantErr          bool
	}{
		{
			name:    "ルールを保存できること",
			wantErr: false,
		},
		{
			name: "CommentTypesとCommentTypePathsを含むルールを保存できること",
			commentTypes: []rule.CommentType{
				{ID: "ct1", RuleID: "test-id", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "ct2", RuleID: "test-id", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{ID: "ctp1", RuleID: "test-id", FromCommentTypeID: "ct1", ToCommentTypeID: "ct2"},
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			r := con.RuleFac.BuildRule(rule.BuildRuleParams{
				ID: "test-id",
				NewRuleParams: rule.NewRuleParams{
					Name:             "test-rule",
					Description:      "test-description",
					CreatedBy:        "test-user",
					CreatedAt:        time.Now(),
					CommentTypes:     tt.commentTypes,
					CommentTypePaths: tt.commentTypePaths,
				},
			})
			con.RuleRepo.(*rule.MockRepository).EXPECT().Save(r).Return(nil)

			err := r.Save()
			if (err != nil) != tt.wantErr {
				t.Errorf("Save() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestRule_Delete(t *testing.T) {
	tests := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "ルールを削除できること",
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			r := con.RuleFac.BuildRule(rule.BuildRuleParams{
				ID: "test-id",
				NewRuleParams: rule.NewRuleParams{
					Name:        "test-rule",
					Description: "test-description",
					CreatedBy:   "test-user",
					CreatedAt:   time.Now(),
				},
			})
			con.RuleRepo.(*rule.MockRepository).EXPECT().Delete(r).Return(nil)

			err := r.Delete()
			if (err != nil) != tt.wantErr {
				t.Errorf("Delete() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestRule_CommentTypesAndPaths(t *testing.T) {
	tests := []struct {
		name                    string
		commentTypes            []rule.CommentType
		commentTypePaths        []rule.CommentTypePath
		wantCommentTypesLen     int
		wantCommentTypePathsLen int
	}{
		{
			name: "コメントタイプとパスを取得できること",
			commentTypes: []rule.CommentType{
				{ID: "ct1", RuleID: "test-id", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "ct2", RuleID: "test-id", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{ID: "ctp1", RuleID: "test-id", FromCommentTypeID: "ct1", ToCommentTypeID: "ct2"},
			},
			wantCommentTypesLen:     2,
			wantCommentTypePathsLen: 1,
		},
		{
			name:                    "空のコメントタイプとパスを取得できること",
			commentTypes:            []rule.CommentType{},
			commentTypePaths:        []rule.CommentTypePath{},
			wantCommentTypesLen:     0,
			wantCommentTypePathsLen: 0,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			con := newContainer(t)
			r := con.RuleFac.BuildRule(rule.BuildRuleParams{
				ID: "test-id",
				NewRuleParams: rule.NewRuleParams{
					Name:             "test-rule",
					Description:      "test-description",
					CreatedBy:        "test-user",
					CreatedAt:        time.Now(),
					CommentTypes:     tt.commentTypes,
					CommentTypePaths: tt.commentTypePaths,
				},
			})

			gotCommentTypes := r.CommentTypes()
			if len(gotCommentTypes) != tt.wantCommentTypesLen {
				t.Errorf("CommentTypes() len = %v, want %v", len(gotCommentTypes), tt.wantCommentTypesLen)
			}

			gotCommentTypePaths := r.CommentTypePaths()
			if len(gotCommentTypePaths) != tt.wantCommentTypePathsLen {
				t.Errorf("CommentTypePaths() len = %v, want %v", len(gotCommentTypePaths), tt.wantCommentTypePathsLen)
			}
		})
	}
}
