package discussion

import (
	"time"

	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/service/clock"
	"github.com/fourbetween/app-supportocol/internal/service/id"
)

type Factory struct {
	repo     Repository
	idSrv    id.Service
	clockSrv clock.Service
	ruleRepo rule.Repository
}

func NewFactory(
	repo Repository,
	idSrv id.Service,
	clockSrv clock.Service,
	ruleRepo rule.Repository,
) *Factory {
	return &Factory{
		repo:     repo,
		idSrv:    idSrv,
		clockSrv: clockSrv,
		ruleRepo: ruleRepo,
	}
}

type NewDiscussionParams struct {
	Theme                  string
	Background             string
	Conclusion             string
	RuleID                 string
	VisibilityLevel        VisibilityLevel
	CommentPermissionLevel CommentPermissionLevel
	CreatedBy              string
	Status                 Status
}

func (f *Factory) NewDiscussion(params NewDiscussionParams) *Discussion {
	id := f.idSrv.Generate()
	return f.BuildDiscussion(BuildDiscussionParams{
		ID:                  id,
		NewDiscussionParams: params,
		CreatedAt:           f.clockSrv.Now(),
	})
}

type BuildDiscussionParams struct {
	ID string
	NewDiscussionParams
	CreatedAt time.Time
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
		fac:                    f,
		ruleRepo:               f.ruleRepo,
	}
}

type NewCommentParams struct {
	DiscussionID    string
	ParentCommentID string
	CommentTypeID   string
	Content         string
	PostedBy        string
}

func (f *Factory) NewComment(params NewCommentParams) *Comment {
	id := f.idSrv.Generate()
	return f.BuildComment(BuildCommentParams{
		ID:               id,
		NewCommentParams: params,
		PostedAt:         f.clockSrv.Now(),
		Status:           CommentStatusUnassigned,
	})
}

type BuildCommentParams struct {
	ID string
	NewCommentParams
	PostedAt time.Time
	Status   CommentStatus
}

func (f *Factory) BuildComment(params BuildCommentParams) *Comment {
	return &Comment{
		id:              params.ID,
		discussionID:    params.DiscussionID,
		parentCommentID: params.ParentCommentID,
		commentTypeID:   params.CommentTypeID,
		content:         params.Content,
		postedBy:        params.PostedBy,
		postedAt:        params.PostedAt,
		status:          params.Status,
		repo:            f.repo,
	}
}

type NewIssueParams struct {
	CommentID   string
	IssueType   IssueType
	Description string
	CreatedBy   string
}

func (f *Factory) NewIssue(params NewIssueParams) *Issue {
	id := f.idSrv.Generate()
	return f.BuildIssue(BuildIssueParams{
		ID:             id,
		NewIssueParams: params,
		CreatedAt:      f.clockSrv.Now(),
	})
}

type BuildIssueParams struct {
	ID string
	NewIssueParams
	CreatedAt time.Time
}

func (f *Factory) BuildIssue(params BuildIssueParams) *Issue {
	return &Issue{
		id:          params.ID,
		commentID:   params.CommentID,
		issueType:   params.IssueType,
		description: params.Description,
		createdBy:   params.CreatedBy,
		createdAt:   params.CreatedAt,
		repo:        f.repo,
	}
}

type NewNoteParams struct {
	DiscussionID string
	Content      string
	PostedBy     string
}

func (f *Factory) NewNote(params NewNoteParams) *Note {
	id := f.idSrv.Generate()
	return f.BuildNote(BuildNoteParams{
		ID:            id,
		NewNoteParams: params,
		PostedAt:      f.clockSrv.Now(),
	})
}

type BuildNoteParams struct {
	ID string
	NewNoteParams
	PostedAt time.Time
}

func (f *Factory) BuildNote(params BuildNoteParams) *Note {
	return &Note{
		id:           params.ID,
		discussionID: params.DiscussionID,
		content:      params.Content,
		postedBy:     params.PostedBy,
		postedAt:     params.PostedAt,
		repo:         f.repo,
	}
}
