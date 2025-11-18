package db

import (
	"fmt"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/model"
	"github.com/fourbetween/app-supportocol/internal/db/.gen/public/table"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
)

type (
	RuleRepository struct {
		db  qrm.DB
		fac *rule.Factory
	}
)

func NewRuleRepository(
	db qrm.DB,
) *RuleRepository {
	return &RuleRepository{db: db}
}

func (r *RuleRepository) SetFactory(fac *rule.Factory) {
	r.fac = fac
}

func (r *RuleRepository) Save(rl *rule.Rule) error {
	ruleRecord := model.Rules{
		ID:          rl.ID(),
		Name:        rl.Name(),
		Description: rl.Description(),
		CreatedBy:   rl.CreatedBy(),
		CreatedAt:   rl.CreatedAt(),
	}

	ruleStmt := table.Rules.
		INSERT(table.Rules.AllColumns).
		MODEL(ruleRecord).
		ON_CONFLICT(table.Rules.ID).
		DO_UPDATE(
			postgres.SET(
				table.Rules.Name.SET(table.Rules.EXCLUDED.Name),
				table.Rules.Description.SET(table.Rules.EXCLUDED.Description),
				table.Rules.CreatedBy.SET(table.Rules.EXCLUDED.CreatedBy),
				table.Rules.CreatedAt.SET(table.Rules.EXCLUDED.CreatedAt),
			),
		)

	if _, err := ruleStmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save rule: %w", err)
	}

	return nil
}

func (r *RuleRepository) Delete(rl *rule.Rule) error {
	stmt := table.Rules.
		DELETE().
		WHERE(table.Rules.ID.EQ(postgres.String(rl.ID())))

	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete rule: %w", err)
	}

	return nil
}

func (r *RuleRepository) Load(params rule.LoadParams) (*rule.Rule, error) {
	cond := table.Rules.ID.EQ(postgres.String(params.ID))
	if params.CreatedBy != "" {
		cond = cond.AND(table.Rules.CreatedBy.EQ(postgres.String(params.CreatedBy)))
	}

	rules, err := r.searchByCondition(cond)
	if err != nil {
		return nil, err
	}
	if len(rules) == 0 {
		return nil, fmt.Errorf(
			"rule id=%s, created_by=%s not found: %w",
			params.ID,
			params.CreatedBy,
			internal.ErrNotFound,
		)
	}
	return rules[0], nil
}

func (r *RuleRepository) Search(params rule.SearchParams) ([]*rule.Rule, error) {
	cond := postgres.Bool(true)
	if params.CreatedBy != "" {
		cond = cond.AND(table.Rules.CreatedBy.EQ(postgres.String(params.CreatedBy)))
	}
	return r.searchByCondition(cond)
}

func (r *RuleRepository) searchByCondition(cond postgres.BoolExpression) ([]*rule.Rule, error) {
	stmt := postgres.
		SELECT(table.Rules.AllColumns).
		FROM(table.Rules).
		WHERE(cond)

	var dest []model.Rules
	if err := stmt.Query(r.db, &dest); err != nil {
		return nil, fmt.Errorf("failed to query rules: %w", err)
	}

	if len(dest) == 0 {
		return []*rule.Rule{}, nil
	}

	rules := make([]*rule.Rule, len(dest))
	for i, row := range dest {
		rules[i] = r.fac.BuildRule(rule.BuildRuleParams{
			ID: row.ID,
			NewRuleParams: rule.NewRuleParams{
				Name:        row.Name,
				Description: row.Description,
				CreatedBy:   row.CreatedBy,
				CreatedAt:   row.CreatedAt,
			},
		})
	}

	return rules, nil
}
