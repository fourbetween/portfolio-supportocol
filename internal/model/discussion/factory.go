package discussion

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/service/clock"
	"github.com/fourbetween/app-supportocol/internal/service/id"
)

type (
	Factory struct {
		repo     Repository
		idSrv    id.Service
		clockSrv clock.Service
	}

	NewDiscussionParams struct {
		Theme                  string
		Background             string
		Conclusion             string
		RuleID                 string
		VisibilityLevel        VisibilityLevel
		CommentPermissionLevel CommentPermissionLevel
		CreatedBy              string
		Status                 Status
	}

	BuildDiscussionParams struct {
		ID string
		NewDiscussionParams
		CreatedAt time.Time
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

func (f *Factory) NewDiscussion(params NewDiscussionParams) *Discussion {
	id := f.idSrv.Generate()
	return f.BuildDiscussion(BuildDiscussionParams{
		ID:                  id,
		NewDiscussionParams: params,
		CreatedAt:           f.clockSrv.Now(),
	})
}

func (f *Factory) BuildDiscussion(params BuildDiscussionParams) *Discussion {
	return &Discussion{
		id:                     params.ID,
		theme:                  params.Theme,
		background:             params.Background,
		conclusion:             params.Conclusion,
		ruleID:                 params.RuleID,
		visibilityLevel:        params.VisibilityLevel,
		commentPermissionLevel: params.CommentPermissionLevel,
		createdBy:              params.CreatedBy,
		createdAt:              params.CreatedAt,
		status:                 params.Status,
		repo:                   f.repo,
	}
}
