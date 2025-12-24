package api

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/api/oas"
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	"github.com/fourbetween/pkg-auth/jwt"
	authuser "github.com/fourbetween/pkg-auth/user"
	uow "github.com/fourbetween/pkg-uow"
	"github.com/ogen-go/ogen/ogenerrors"
)

const (
	authCookieName = "auth_token"
	cookieMaxAge   = 30 * 24 * time.Hour
)

type appHandler struct {
	uowSrv uow.UnitOfWork[*container]
	jwtSrv jwt.Service
}

func (h *appHandler) AuthGooglePost(ctx context.Context, req *oas.GoogleLoginRequest) error {
	var u authuser.User
	if err := h.uowSrv.Do(ctx, func(con *container) error {
		var err error
		u, err = con.authSrv.LoginWithGoogle(ctx, req.IdToken)
		return err
	}); err != nil {
		return err
	}

	return h.setAuthCookie(ctx, u)
}

func (h *appHandler) AuthLogoutPost(ctx context.Context) error {
	w := getResponseWriter(ctx)
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	return nil
}

func (h *appHandler) MeGet(ctx context.Context) (*oas.User, error) {
	var u *user.User
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			var err error
			u, err = h.loadUser(ctx, con)
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasUser(u)
	return &res, nil
}

func (h *appHandler) ProjectsGet(ctx context.Context) ([]oas.Project, error) {
	var items []*project.Project
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			items, err = u.ListProjects()
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Project, len(items))
	for i, v := range items {
		res[i] = h.toOasProject(v)
	}
	return res, nil
}

func (h *appHandler) ProjectsPost(ctx context.Context, req *oas.ProjectsPostReq) (*oas.Project, error) {
	var item *project.Project
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.CreateProject(user.CreateProjectParams{
				Name: req.Name,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasProject(item)
	return &res, nil
}

func (h *appHandler) ProjectsProjectIdDelete(ctx context.Context, params oas.ProjectsProjectIdDeleteParams) error {
	return h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			return u.DeleteProject(user.DeleteProjectParams{
				ProjectID: string(params.ProjectId),
			})
		},
	)
}

func (h *appHandler) ProjectsProjectIdGet(ctx context.Context, params oas.ProjectsProjectIdGetParams) (*oas.Project, error) {
	var item *project.Project
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.LoadProject(user.LoadProjectParams{
				ProjectID: string(params.ProjectId),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasProject(item)
	return &res, nil
}

func (h *appHandler) ProjectsProjectIdPut(ctx context.Context, req *oas.ProjectsProjectIdPutReq, params oas.ProjectsProjectIdPutParams) (*oas.Project, error) {
	var item *project.Project
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.UpdateProject(user.UpdateProjectParams{
				ProjectID: string(params.ProjectId),
				Name:      req.Name,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasProject(item)
	return &res, nil
}

func (h *appHandler) RulesGet(ctx context.Context) ([]oas.Rule, error) {
	var items []*rule.Rule
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			items, err = u.ListRules()
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Rule, len(items))
	for i, v := range items {
		res[i] = h.toOasRule(v)
	}
	return res, nil
}

func (h *appHandler) RulesPost(ctx context.Context, req *oas.RulesPostReq) (*oas.Rule, error) {
	var item *rule.Rule
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.CreateRule(user.CreateRuleParams{
				Name:             req.Name,
				Description:      req.Description,
				CommentTypes:     h.toRuleCommentTypes(req.CommentTypes),
				CommentTypePaths: h.toRuleCommentTypePaths(req.CommentTypePaths),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasRule(item)
	return &res, nil
}

func (h *appHandler) RulesRuleIdDelete(ctx context.Context, params oas.RulesRuleIdDeleteParams) error {
	return h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			return u.DeleteRule(user.DeleteRuleParams{
				RuleID: string(params.RuleId),
			})
		},
	)
}

func (h *appHandler) RulesRuleIdGet(ctx context.Context, params oas.RulesRuleIdGetParams) (*oas.Rule, error) {
	var item *rule.Rule
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.LoadRule(user.LoadRuleParams{
				RuleID: string(params.RuleId),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasRule(item)
	return &res, nil
}

func (h *appHandler) RulesRuleIdPut(ctx context.Context, req *oas.RulesRuleIdPutReq, params oas.RulesRuleIdPutParams) (*oas.Rule, error) {
	var item *rule.Rule
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.UpdateRule(user.UpdateRuleParams{
				RuleID:           string(params.RuleId),
				Name:             req.Name,
				Description:      req.Description,
				CommentTypes:     h.toRuleCommentTypes(req.CommentTypes),
				CommentTypePaths: h.toRuleCommentTypePaths(req.CommentTypePaths),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasRule(item)
	return &res, nil
}

func (h *appHandler) DiscussionsGet(ctx context.Context, params oas.DiscussionsGetParams) ([]oas.Discussion, error) {
	var items []*discussion.Discussion
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			projectID := ""
			if params.ProjectId.IsSet() {
				projectID = string(params.ProjectId.Value)
			}
			items, err = u.ListDiscussions(user.ListDiscussionsParams{
				ProjectID: projectID,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Discussion, len(items))
	for i, v := range items {
		res[i] = h.toOasDiscussion(v)
	}
	return res, nil
}

func (h *appHandler) DiscussionsPost(ctx context.Context, req *oas.DiscussionsPostReq) (*oas.Discussion, error) {
	var item *discussion.Discussion
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.CreateDiscussion(user.CreateDiscussionParams{
				Theme:                  req.Theme,
				Background:             req.Background,
				Conclusion:             req.Conclusion,
				RuleID:                 string(req.RuleId),
				VisibilityLevel:        discussion.VisibilityLevel(req.VisibilityLevel),
				CommentPermissionLevel: discussion.CommentPermissionLevel(req.CommentPermissionLevel),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdDelete(ctx context.Context, params oas.DiscussionsDiscussionIdDeleteParams) error {
	return h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			return u.DeleteDiscussion(user.DeleteDiscussionParams{
				DiscussionID: string(params.DiscussionId),
			})
		},
	)
}

func (h *appHandler) DiscussionsDiscussionIdGet(ctx context.Context, params oas.DiscussionsDiscussionIdGetParams) (*oas.Discussion, error) {
	var item *discussion.Discussion
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.LoadDiscussion(user.LoadDiscussionParams{
				DiscussionID: string(params.DiscussionId),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdPut(ctx context.Context, req *oas.DiscussionsDiscussionIdPutReq, params oas.DiscussionsDiscussionIdPutParams) (*oas.Discussion, error) {
	var item *discussion.Discussion
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.UpdateDiscussion(user.UpdateDiscussionParams{
				DiscussionID:           string(params.DiscussionId),
				Theme:                  req.Theme,
				Background:             req.Background,
				Conclusion:             req.Conclusion,
				RuleID:                 string(req.RuleId),
				VisibilityLevel:        discussion.VisibilityLevel(req.VisibilityLevel),
				CommentPermissionLevel: discussion.CommentPermissionLevel(req.CommentPermissionLevel),
				Status:                 discussion.Status(req.Status),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdCommentsGet(ctx context.Context, params oas.DiscussionsDiscussionIdCommentsGetParams) ([]oas.Comment, error) {
	var items []*discussion.Comment
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			items, err = u.ListComments(user.ListCommentsParams{
				DiscussionID: string(params.DiscussionId),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Comment, len(items))
	for i, v := range items {
		res[i] = h.toOasComment(v)
	}
	return res, nil
}

func (h *appHandler) DiscussionsDiscussionIdCommentsPost(ctx context.Context, req *oas.DiscussionsDiscussionIdCommentsPostReq, params oas.DiscussionsDiscussionIdCommentsPostParams) (*oas.Comment, error) {
	var item *discussion.Comment
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.CreateComment(user.CreateCommentParams{
				DiscussionID:    string(params.DiscussionId),
				ParentCommentID: req.ParentCommentId,
				CommentTypeID:   string(req.CommentTypeId),
				Content:         req.Content,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdCommentsCommentIdPut(ctx context.Context, req *oas.DiscussionsDiscussionIdCommentsCommentIdPutReq, params oas.DiscussionsDiscussionIdCommentsCommentIdPutParams) (*oas.Comment, error) {
	var item *discussion.Comment
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.UpdateComment(user.UpdateCommentParams{
				DiscussionID:  string(params.DiscussionId),
				CommentID:     string(params.CommentId),
				Content:       req.Content,
				CommentStatus: discussion.CommentStatus(req.Status),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdCommentsCommentIdDelete(ctx context.Context, params oas.DiscussionsDiscussionIdCommentsCommentIdDeleteParams) error {
	return h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			return u.DeleteComment(user.DeleteCommentParams{
				DiscussionID: string(params.DiscussionId),
				CommentID:    string(params.CommentId),
			})
		},
	)
}

func (h *appHandler) DiscussionsDiscussionIdIssuesGet(ctx context.Context, params oas.DiscussionsDiscussionIdIssuesGetParams) ([]oas.Issue, error) {
	var items []*discussion.Issue
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			items, err = u.ListIssues(user.ListIssuesParams{
				DiscussionID: string(params.DiscussionId),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Issue, len(items))
	for i, v := range items {
		res[i] = h.toOasIssue(v)
	}
	return res, nil
}

func (h *appHandler) DiscussionsDiscussionIdIssuesPost(ctx context.Context, req *oas.DiscussionsDiscussionIdIssuesPostReq, params oas.DiscussionsDiscussionIdIssuesPostParams) (*oas.Issue, error) {
	var item *discussion.Issue
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.CreateIssue(user.CreateIssueParams{
				DiscussionID: string(params.DiscussionId),
				CommentID:    string(req.CommentId),
				IssueType:    discussion.IssueType(req.IssueType),
				Description:  req.Description,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasIssue(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdIssuesIssueIdPut(ctx context.Context, req *oas.DiscussionsDiscussionIdIssuesIssueIdPutReq, params oas.DiscussionsDiscussionIdIssuesIssueIdPutParams) (*oas.Issue, error) {
	var item *discussion.Issue
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.UpdateIssue(user.UpdateIssueParams{
				DiscussionID: string(params.DiscussionId),
				IssueID:      string(params.IssueId),
				IssueType:    discussion.IssueType(req.IssueType),
				Description:  req.Description,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasIssue(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdIssuesIssueIdDelete(ctx context.Context, params oas.DiscussionsDiscussionIdIssuesIssueIdDeleteParams) error {
	return h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			return u.DeleteIssue(user.DeleteIssueParams{
				DiscussionID: string(params.DiscussionId),
				IssueID:      string(params.IssueId),
			})
		},
	)
}

func (h *appHandler) DiscussionsDiscussionIdNotesGet(ctx context.Context, params oas.DiscussionsDiscussionIdNotesGetParams) ([]oas.Note, error) {
	var items []*discussion.Note
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			items, err = u.ListNotes(user.ListNotesParams{
				DiscussionID: string(params.DiscussionId),
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Note, len(items))
	for i, v := range items {
		res[i] = h.toOasNote(v)
	}
	return res, nil
}

func (h *appHandler) DiscussionsDiscussionIdNotesPost(ctx context.Context, req *oas.DiscussionsDiscussionIdNotesPostReq, params oas.DiscussionsDiscussionIdNotesPostParams) (*oas.Note, error) {
	var item *discussion.Note
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.CreateNote(user.CreateNoteParams{
				DiscussionID: string(params.DiscussionId),
				Content:      req.Content,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasNote(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdNotesNoteIdPut(ctx context.Context, req *oas.DiscussionsDiscussionIdNotesNoteIdPutReq, params oas.DiscussionsDiscussionIdNotesNoteIdPutParams) (*oas.Note, error) {
	var item *discussion.Note
	if err := h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			item, err = u.UpdateNote(user.UpdateNoteParams{
				DiscussionID: string(params.DiscussionId),
				NoteID:       string(params.NoteId),
				Content:      req.Content,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasNote(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdNotesNoteIdDelete(ctx context.Context, params oas.DiscussionsDiscussionIdNotesNoteIdDeleteParams) error {
	return h.uowSrv.Do(
		ctx,
		func(con *container) error {
			u, err := h.loadUser(ctx, con)
			if err != nil {
				return err
			}
			return u.DeleteNote(user.DeleteNoteParams{
				DiscussionID: string(params.DiscussionId),
				NoteID:       string(params.NoteId),
			})
		},
	)
}

func (h *appHandler) ErrorsPost(ctx context.Context, req *oas.ErrorsPostReq) error {
	slog.Error(
		"frontend error",
		slog.String("message", req.Message),
	)
	return nil
}

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := err.Error()
	if errors.Is(err, ErrUnauthorized) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) {
		code = 401
	}
	if errors.Is(err, internal.ErrForbidden) {
		code = 403
	}
	if errors.Is(err, internal.ErrNotFound) {
		code = 404
	}
	if errors.Is(err, internal.ErrConflict) {
		code = 409
	}
	if code == 500 {
		slog.Error(err.Error())
	}
	return &oas.ErrorStatusCode{
		StatusCode: code,
		Response: oas.Error{
			Code:    code,
			Message: msg,
		},
	}
}

func (h *appHandler) toOasProject(item *project.Project) oas.Project {
	return oas.Project{
		ID:        oas.ID(item.ID()),
		Name:      item.Name(),
		CreatedBy: item.CreatedBy(),
		CreatedAt: item.CreatedAt(),
	}
}

func (h *appHandler) toRuleCommentTypes(cts []oas.CommentType) []rule.CommentType {
	result := make([]rule.CommentType, len(cts))
	for i, v := range cts {
		result[i] = rule.CommentType{
			ID:          string(v.ID),
			No:          v.No,
			Name:        v.Name,
			Description: v.Description,
			Color:       v.Color,
			Root:        v.Root,
		}
	}
	return result
}

func (h *appHandler) toRuleCommentTypePaths(ctps []oas.CommentTypePath) []rule.CommentTypePath {
	result := make([]rule.CommentTypePath, len(ctps))
	for i, v := range ctps {
		result[i] = rule.CommentTypePath{
			ParentCommentTypeID: string(v.ParentCommentTypeId),
			ChildCommentTypeID:  string(v.ChildCommentTypeId),
		}
	}
	return result
}

func (h *appHandler) toOasRule(item *rule.Rule) oas.Rule {
	cts := make([]oas.CommentType, len(item.CommentTypes()))
	for i, v := range item.CommentTypes() {
		cts[i] = oas.CommentType{
			ID:          oas.ID(v.ID),
			No:          v.No,
			Name:        v.Name,
			Description: v.Description,
			Color:       v.Color,
			Root:        v.Root,
		}
	}
	ctps := make([]oas.CommentTypePath, len(item.CommentTypePaths()))
	for i, v := range item.CommentTypePaths() {
		ctps[i] = oas.CommentTypePath{
			ParentCommentTypeId: oas.ID(v.ParentCommentTypeID),
			ChildCommentTypeId:  oas.ID(v.ChildCommentTypeID),
		}
	}
	return oas.Rule{
		ID:               oas.ID(item.ID()),
		Name:             item.Name(),
		Description:      item.Description(),
		CreatedBy:        item.CreatedBy(),
		CreatedAt:        item.CreatedAt(),
		CommentTypes:     cts,
		CommentTypePaths: ctps,
	}
}

func (h *appHandler) toOasDiscussion(item *discussion.Discussion) oas.Discussion {
	return oas.Discussion{
		ID:                     oas.ID(item.ID()),
		Theme:                  item.Theme(),
		Background:             item.Background(),
		Conclusion:             item.Conclusion(),
		RuleId:                 oas.ID(item.RuleID()),
		VisibilityLevel:        oas.VisibilityLevel(item.VisibilityLevel()),
		CommentPermissionLevel: oas.CommentPermissionLevel(item.CommentPermissionLevel()),
		CreatedBy:              item.CreatedBy(),
		CreatedAt:              item.CreatedAt(),
		Status:                 oas.DiscussionStatus(item.Status()),
	}
}

func (h *appHandler) toOasComment(item *discussion.Comment) oas.Comment {
	return oas.Comment{
		ID:              oas.ID(item.ID()),
		DiscussionId:    oas.ID(item.DiscussionID()),
		ParentCommentId: oas.ID(item.ParentCommentID()),
		CommentTypeId:   oas.ID(item.CommentTypeID()),
		Content:         item.Content(),
		PostedBy:        item.PostedBy(),
		CreatedAt:       item.CreatedAt(),
		Status:          oas.CommentStatus(item.Status()),
	}
}

func (h *appHandler) toOasIssue(item *discussion.Issue) oas.Issue {
	return oas.Issue{
		ID:          oas.ID(item.ID()),
		CommentId:   oas.ID(item.CommentID()),
		IssueType:   oas.IssueIssueType(item.IssueType()),
		Description: item.Description(),
		CreatedBy:   item.CreatedBy(),
		CreatedAt:   item.CreatedAt(),
	}
}

func (h *appHandler) toOasNote(item *discussion.Note) oas.Note {
	return oas.Note{
		ID:           oas.ID(item.ID()),
		DiscussionId: oas.ID(item.DiscussionID()),
		Content:      item.Content(),
		PostedBy:     item.PostedBy(),
		CreatedAt:    item.CreatedAt(),
	}
}

func (h *appHandler) loadUser(ctx context.Context, con *container) (*user.User, error) {
	uid := getUserID(ctx)
	if uid == "" {
		return nil, ErrUnauthorized
	}
	return con.userRepo.FindByID(uid)
}

func (h *appHandler) toOasUser(u *user.User) oas.User {
	return oas.User{
		ID:    u.ID(),
		Email: u.Email(),
		Name:  u.Name(),
	}
}

func (h *appHandler) setAuthCookie(ctx context.Context, u authuser.User) error {
	token, err := h.jwtSrv.Generate(u.ID())
	if err != nil {
		return err
	}

	w := getResponseWriter(ctx)
	http.SetCookie(w, &http.Cookie{
		Name:     authCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   int(cookieMaxAge.Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	return nil
}
