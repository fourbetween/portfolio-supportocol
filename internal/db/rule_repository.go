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

	if err := r.deleteCommentTypesAndPaths(rl.ID()); err != nil {
		return err
	}

	if err := r.saveCommentTypes(rl.ID(), rl.CommentTypes()); err != nil {
		return err
	}

	if err := r.saveCommentTypePaths(rl.ID(), rl.CommentTypePaths()); err != nil {
		return err
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

	ruleIDs := extractRuleIDs(dest)
	commentTypesByRuleID, err := r.fetchCommentTypesByRuleIDs(ruleIDs)
	if err != nil {
		return nil, err
	}

	commentTypePathsByRuleID, err := r.fetchCommentTypePathsByRuleIDs(ruleIDs)
	if err != nil {
		return nil, err
	}

	return r.buildRules(dest, commentTypesByRuleID, commentTypePathsByRuleID), nil
}

func (r *RuleRepository) deleteCommentTypesAndPaths(ruleID string) error {
	deleteCommentTypesStmt := table.CommentTypes.
		DELETE().
		WHERE(table.CommentTypes.RuleID.EQ(postgres.String(ruleID)))
	if _, err := deleteCommentTypesStmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete existing comment types: %w", err)
	}

	deleteCommentTypePathsStmt := table.CommentTypePaths.
		DELETE().
		WHERE(table.CommentTypePaths.RuleID.EQ(postgres.String(ruleID)))
	if _, err := deleteCommentTypePathsStmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to delete existing comment type paths: %w", err)
	}

	return nil
}

func (r *RuleRepository) saveCommentTypes(ruleID string, commentTypes []rule.CommentType) error {
	if len(commentTypes) == 0 {
		return nil
	}

	commentTypeRecords := make([]model.CommentTypes, len(commentTypes))
	for i, ct := range commentTypes {
		commentTypeRecords[i] = model.CommentTypes{
			ID:          ct.ID,
			RuleID:      ruleID,
			No:          int32(ct.No),
			Name:        ct.Name,
			Description: ct.Description,
			Color:       ct.Color,
			Root:        ct.Root,
		}
	}

	stmt := table.CommentTypes.
		INSERT(table.CommentTypes.AllColumns).
		MODELS(commentTypeRecords)
	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save comment types: %w", err)
	}

	return nil
}

func (r *RuleRepository) saveCommentTypePaths(ruleID string, commentTypePaths []rule.CommentTypePath) error {
	if len(commentTypePaths) == 0 {
		return nil
	}

	commentTypePathRecords := make([]model.CommentTypePaths, len(commentTypePaths))
	for i, ctp := range commentTypePaths {
		commentTypePathRecords[i] = model.CommentTypePaths{
			RuleID:              ruleID,
			ChildCommentTypeID:  ctp.ChildCommentTypeID,
			ParentCommentTypeID: ctp.ParentCommentTypeID,
		}
	}

	stmt := table.CommentTypePaths.
		INSERT(table.CommentTypePaths.AllColumns).
		MODELS(commentTypePathRecords)
	if _, err := stmt.Exec(r.db); err != nil {
		return fmt.Errorf("failed to save comment type paths: %w", err)
	}

	return nil
}

func extractRuleIDs(rules []model.Rules) []string {
	ruleIDs := make([]string, len(rules))
	for i, row := range rules {
		ruleIDs[i] = row.ID
	}
	return ruleIDs
}

func (r *RuleRepository) fetchCommentTypesByRuleIDs(ruleIDs []string) (map[string][]rule.CommentType, error) {
	stmt := postgres.
		SELECT(table.CommentTypes.AllColumns).
		FROM(table.CommentTypes).
		WHERE(table.CommentTypes.RuleID.IN(toPostgresStrings(ruleIDs)...)).
		ORDER_BY(table.CommentTypes.RuleID.ASC(), table.CommentTypes.No.ASC())

	var records []model.CommentTypes
	if err := stmt.Query(r.db, &records); err != nil {
		return nil, fmt.Errorf("failed to query comment types: %w", err)
	}

	result := make(map[string][]rule.CommentType)
	for _, ct := range records {
		result[ct.RuleID] = append(result[ct.RuleID], rule.CommentType{
			ID:          ct.ID,
			No:          int(ct.No),
			Name:        ct.Name,
			Description: ct.Description,
			Color:       ct.Color,
			Root:        ct.Root,
		})
	}

	return result, nil
}

func (r *RuleRepository) fetchCommentTypePathsByRuleIDs(ruleIDs []string) (map[string][]rule.CommentTypePath, error) {
	stmt := postgres.
		SELECT(table.CommentTypePaths.AllColumns).
		FROM(table.CommentTypePaths).
		WHERE(table.CommentTypePaths.RuleID.IN(toPostgresStrings(ruleIDs)...))

	var records []model.CommentTypePaths
	if err := stmt.Query(r.db, &records); err != nil {
		return nil, fmt.Errorf("failed to query comment type paths: %w", err)
	}

	result := make(map[string][]rule.CommentTypePath)
	for _, ctp := range records {
		result[ctp.RuleID] = append(result[ctp.RuleID], rule.CommentTypePath{
			ChildCommentTypeID:  ctp.ChildCommentTypeID,
			ParentCommentTypeID: ctp.ParentCommentTypeID,
		})
	}

	return result, nil
}

func (r *RuleRepository) buildRules(
	dest []model.Rules,
	commentTypesByRuleID map[string][]rule.CommentType,
	commentTypePathsByRuleID map[string][]rule.CommentTypePath,
) []*rule.Rule {
	rules := make([]*rule.Rule, len(dest))
	for i, row := range dest {
		rules[i] = r.fac.BuildRule(rule.BuildRuleParams{
			ID: row.ID,
			NewRuleParams: rule.NewRuleParams{
				Name:             row.Name,
				Description:      row.Description,
				CreatedBy:        row.CreatedBy,
				CreatedAt:        row.CreatedAt,
				CommentTypes:     commentTypesByRuleID[row.ID],
				CommentTypePaths: commentTypePathsByRuleID[row.ID],
			},
		})
	}
	return rules
}
