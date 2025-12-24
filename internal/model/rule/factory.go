package rule

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/service/clock"
	id "github.com/fourbetween/pkg-id"
)

type (
	Factory struct {
		repo     Repository
		idSrv    id.Service
		clockSrv clock.Service
	}

	NewRuleParams struct {
		Name             string
		Description      string
		CreatedBy        string
		CommentTypes     []CommentType
		CommentTypePaths []CommentTypePath
	}

	BuildRuleParams struct {
		ID string
		NewRuleParams
		CreatedAt time.Time
	}

	NewDefaultRuleParams struct {
		CreatedBy string
	}
)

func NewFactory(
	repo Repository,
	idSrv id.Service,
	clockSrv clock.Service,
) *Factory {
	return &Factory{
		repo:     repo,
		idSrv:    idSrv,
		clockSrv: clockSrv,
	}
}

func (f *Factory) NewRule(params NewRuleParams) (*Rule, error) {
	id := f.idSrv.Generate()
	r := f.BuildRule(BuildRuleParams{
		ID:            id,
		NewRuleParams: params,
		CreatedAt:     f.clockSrv.Now(),
	})
	if err := r.Validate(); err != nil {
		return nil, err
	}
	return r, nil
}

func (f *Factory) BuildRule(params BuildRuleParams) *Rule {
	return &Rule{
		id:               params.ID,
		name:             params.Name,
		description:      params.Description,
		createdBy:        params.CreatedBy,
		createdAt:        params.CreatedAt,
		commentTypes:     params.CommentTypes,
		commentTypePaths: params.CommentTypePaths,
		repo:             f.repo,
	}
}

func (f *Factory) NewDefaultRule(params NewDefaultRuleParams) (*Rule, error) {
	problemID := f.idSrv.Generate()
	solutionID := f.idSrv.Generate()
	agreeID := f.idSrv.Generate()
	disagreeID := f.idSrv.Generate()
	questionID := f.idSrv.Generate()
	answerID := f.idSrv.Generate()

	commentTypes := []CommentType{
		{ID: problemID, No: 1, Name: "問題", Description: "議論の対象となる問題を提起する", Color: "#E53935", Root: true},
		{ID: solutionID, No: 2, Name: "対応", Description: "問題に対する解決策を提案する", Color: "#43A047", Root: false},
		{ID: agreeID, No: 3, Name: "賛成", Description: "コメントに賛成の意見を表明する", Color: "#1E88E5", Root: false},
		{ID: disagreeID, No: 4, Name: "反対", Description: "コメントに反対の意見を表明する", Color: "#FB8C00", Root: false},
		{ID: questionID, No: 5, Name: "質問", Description: "コメントに対して質問をする", Color: "#8E24AA", Root: true},
		{ID: answerID, No: 6, Name: "回答", Description: "質問に対して回答する", Color: "#00ACC1", Root: false},
	}

	commentTypePaths := []CommentTypePath{
		// 問題に対して
		{ParentCommentTypeID: problemID, ChildCommentTypeID: solutionID},
		{ParentCommentTypeID: problemID, ChildCommentTypeID: agreeID},
		{ParentCommentTypeID: problemID, ChildCommentTypeID: disagreeID},
		{ParentCommentTypeID: problemID, ChildCommentTypeID: questionID},
		// 対応に対して
		{ParentCommentTypeID: solutionID, ChildCommentTypeID: agreeID},
		{ParentCommentTypeID: solutionID, ChildCommentTypeID: disagreeID},
		{ParentCommentTypeID: solutionID, ChildCommentTypeID: questionID},
		// 賛成・反対に対して
		{ParentCommentTypeID: agreeID, ChildCommentTypeID: agreeID},
		{ParentCommentTypeID: agreeID, ChildCommentTypeID: disagreeID},
		{ParentCommentTypeID: agreeID, ChildCommentTypeID: questionID},
		{ParentCommentTypeID: disagreeID, ChildCommentTypeID: agreeID},
		{ParentCommentTypeID: disagreeID, ChildCommentTypeID: disagreeID},
		{ParentCommentTypeID: disagreeID, ChildCommentTypeID: questionID},
		// 質問に対して
		{ParentCommentTypeID: questionID, ChildCommentTypeID: answerID},
		// 回答に対して
		{ParentCommentTypeID: answerID, ChildCommentTypeID: agreeID},
		{ParentCommentTypeID: answerID, ChildCommentTypeID: disagreeID},
		{ParentCommentTypeID: answerID, ChildCommentTypeID: questionID},
	}

	return f.NewRule(NewRuleParams{
		Name:             "汎用ルール",
		Description:      "一般的な議論で使用できる汎用的なルールです",
		CreatedBy:        params.CreatedBy,
		CommentTypes:     commentTypes,
		CommentTypePaths: commentTypePaths,
	})
}
