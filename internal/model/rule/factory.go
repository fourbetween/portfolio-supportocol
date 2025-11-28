package rule

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/service/id"
)

type (
	Factory struct {
		repo  Repository
		idSrv id.Service
	}

	NewRuleParams struct {
		Name             string
		Description      string
		CreatedBy        string
		CreatedAt        time.Time
		CommentTypes     []CommentType
		CommentTypePaths []CommentTypePath
	}

	BuildRuleParams struct {
		ID string
		NewRuleParams
	}
)

func NewFactory(
	repo Repository,
	idSrv id.Service,
) *Factory {
	return &Factory{
		repo:  repo,
		idSrv: idSrv,
	}
}

func (f *Factory) NewRule(params NewRuleParams) (*Rule, error) {
	id := f.idSrv.Generate()
	r := f.BuildRule(BuildRuleParams{
		ID:            id,
		NewRuleParams: params,
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
