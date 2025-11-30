package rule_test

import (
	"errors"
	"testing"
	"time"

	"github.com/fourbetween/app-supportocol/internal"
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
				{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "ct2", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "ct1", ToCommentTypeID: "ct2"},
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
				{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "ct2", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "ct1", ToCommentTypeID: "ct2"},
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

func TestRule_Validate(t *testing.T) {
	tests := []struct {
		name             string
		commentTypes     []rule.CommentType
		commentTypePaths []rule.CommentTypePath
		wantErr          bool
	}{
		{
			name: "矛盾がない場合はエラーを返さないこと",
			commentTypes: []rule.CommentType{
				{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "ct2", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "ct1", ToCommentTypeID: "ct2"},
			},
			wantErr: false,
		},
		{
			name:             "空のルールはエラーを返さないこと",
			commentTypes:     []rule.CommentType{},
			commentTypePaths: []rule.CommentTypePath{},
			wantErr:          false,
		},
		{
			name: "FromCommentTypeIDが存在しない場合はエラーを返すこと",
			commentTypes: []rule.CommentType{
				{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "ct999", ToCommentTypeID: "ct1"},
			},
			wantErr: true,
		},
		{
			name: "ToCommentTypeIDが存在しない場合はエラーを返すこと",
			commentTypes: []rule.CommentType{
				{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "ct1", ToCommentTypeID: "ct999"},
			},
			wantErr: true,
		},
		{
			name: "CommentTypeIDが重複している場合はエラーを返すこと",
			commentTypes: []rule.CommentType{
				{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "ct1", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{},
			wantErr:          true,
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

			err := r.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.wantErr && !errors.Is(err, internal.ErrConflict) {
				t.Errorf("Validate() error should wrap ErrConflict, got %v", err)
			}
		})
	}
}

func TestRule_Update(t *testing.T) {
	tests := []struct {
		name    string
		params  rule.UpdateParams
		wantErr bool
		verify  func(*testing.T, *rule.Rule)
	}{
		{
			name: "ルールを更新できること",
			params: rule.UpdateParams{
				Name:        "updated-rule",
				Description: "updated-description",
				CommentTypes: []rule.CommentType{
					{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				},
				CommentTypePaths: []rule.CommentTypePath{
					{FromCommentTypeID: "ct1", ToCommentTypeID: "ct1"},
				},
			},
			wantErr: false,
			verify: func(t *testing.T, r *rule.Rule) {
				if r.Name() != "updated-rule" {
					t.Errorf("Name() = %v, want %v", r.Name(), "updated-rule")
				}
				if r.Description() != "updated-description" {
					t.Errorf("Description() = %v, want %v", r.Description(), "updated-description")
				}
				if len(r.CommentTypes()) != 1 {
					t.Errorf("CommentTypes() len = %v, want %v", len(r.CommentTypes()), 1)
				}
				if len(r.CommentTypePaths()) != 1 {
					t.Errorf("CommentTypePaths() len = %v, want %v", len(r.CommentTypePaths()), 1)
				}
			},
		},
		{
			name: "矛盾がある更新はエラーを返すこと",
			params: rule.UpdateParams{
				Name:        "updated-rule",
				Description: "updated-description",
				CommentTypes: []rule.CommentType{
					{ID: "ct1", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				},
				CommentTypePaths: []rule.CommentTypePath{
					{FromCommentTypeID: "ct1", ToCommentTypeID: "ct999"},
				},
			},
			wantErr: true,
			verify: func(t *testing.T, r *rule.Rule) {
				// 元の値のままであること
				if r.Name() != "test-rule" {
					t.Errorf("Name() = %v, want %v", r.Name(), "test-rule")
				}
			},
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

			err := r.Update(tt.params)
			if (err != nil) != tt.wantErr {
				t.Errorf("Update() error = %v, wantErr %v", err, tt.wantErr)
			}

			if tt.verify != nil {
				tt.verify(t, r)
			}
		})
	}
}

func TestRule_IsValidPath(t *testing.T) {
	tests := []struct {
		name              string
		commentTypes      []rule.CommentType
		commentTypePaths  []rule.CommentTypePath
		fromCommentTypeID string // 子コメントのタイプ
		toCommentTypeID   string // 親コメントのタイプ
		wantErr           bool
	}{
		{
			// 経路: From=子コメント, To=親コメント
			// 子コメント(根拠)が親コメント(主張)に対して許可されている
			name: "子コメントから親コメントへの有効な経路の場合にエラーを返さないこと",
			commentTypes: []rule.CommentType{
				{ID: "claim", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "evidence", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "evidence", ToCommentTypeID: "claim"},
			},
			fromCommentTypeID: "evidence", // 子コメント
			toCommentTypeID:   "claim",    // 親コメント
			wantErr:           false,
		},
		{
			// 逆方向の経路は許可されていない
			name: "許可されていない経路の場合にエラーを返すこと",
			commentTypes: []rule.CommentType{
				{ID: "claim", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
				{ID: "evidence", Name: "根拠", Description: "根拠を表すコメント", Color: "#00FF00"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "evidence", ToCommentTypeID: "claim"},
			},
			fromCommentTypeID: "claim",    // 子コメント（しかしこの方向は許可されていない）
			toCommentTypeID:   "evidence", // 親コメント
			wantErr:           true,
		},
		{
			// ルートコメント（親がない）の場合は To が空
			name: "ルートコメントとして許可されている場合にエラーを返さないこと",
			commentTypes: []rule.CommentType{
				{ID: "claim", Name: "主張", Description: "主張を表すコメント", Color: "#FF0000"},
			},
			commentTypePaths: []rule.CommentTypePath{
				{FromCommentTypeID: "claim", ToCommentTypeID: ""},
			},
			fromCommentTypeID: "claim", // ルートとして追加する子コメント
			toCommentTypeID:   "",      // 親がない（ルート）
			wantErr:           false,
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

			err := r.IsValidPath(tt.fromCommentTypeID, tt.toCommentTypeID)
			if (err != nil) != tt.wantErr {
				t.Errorf("IsValidPath() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.wantErr && !errors.Is(err, internal.ErrConflict) {
				t.Errorf("IsValidPath() error should wrap ErrConflict, got %v", err)
			}
		})
	}
}
