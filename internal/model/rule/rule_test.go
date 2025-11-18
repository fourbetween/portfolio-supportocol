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
		name    string
		wantErr bool
	}{
		{
			name:    "ルールを保存できること",
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
