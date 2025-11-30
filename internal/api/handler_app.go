package api

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/api/oas"
	"github.com/fourbetween/app-supportocol/internal/model/discussion"
	"github.com/fourbetween/app-supportocol/internal/model/project"
	"github.com/fourbetween/app-supportocol/internal/model/rule"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	auth "github.com/fourbetween/pkg-auth"
	uow "github.com/fourbetween/pkg-uow"
	"github.com/ogen-go/ogen/ogenerrors"
)

func NewHttpHandler(
	uowSrv uow.UnitOfWork[*Container],
	authSrv auth.Auth,
) (http.Handler, error) {
	app := &appHandler{
		uowSrv: uowSrv,
	}
	sec := &securityHandler{
		authSrv: authSrv,
	}
	return oas.NewServer(app, sec, oas.WithErrorHandler(errorHandler))
}

type appHandler struct {
	uowSrv uow.UnitOfWork[*Container]
}

func (h *appHandler) WorkbooksGet(ctx context.Context) ([]oas.Workbook, error) {
	var items []*workbook.Workbook
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			items, err = u.SearchWorkbooks()
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Workbook, len(items))
	for i, v := range items {
		res[i] = h.toOasWorkbook(v)
	}
	return res, nil
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

func (h *appHandler) ProjectsGet(ctx context.Context) ([]oas.Project, error) {
	var items []*project.Project
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) ProjectsPost(ctx context.Context, req oas.OptProjectsPostReq) (*oas.Project, error) {
	var item *project.Project
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.CreateProject(user.CreateProjectParams{
				Name: req.Value.Name,
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
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			return u.DeleteProject(user.DeleteProjectParams{
				ProjectID: string(params.ProjectId),
			})
		},
	)
}

func (h *appHandler) ProjectsProjectIdGet(ctx context.Context, params oas.ProjectsProjectIdGetParams) (*oas.Project, error) {
	var item *project.Project
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) ProjectsProjectIdPut(ctx context.Context, req oas.OptProjectsProjectIdPutReq, params oas.ProjectsProjectIdPutParams) (*oas.Project, error) {
	var item *project.Project
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.UpdateProject(user.UpdateProjectParams{
				ProjectID: string(params.ProjectId),
				Name:      req.Value.Name,
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
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) RulesPost(ctx context.Context, req oas.OptRulesPostReq) (*oas.Rule, error) {
	var item *rule.Rule
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			cts := make([]rule.CommentType, len(req.Value.CommentTypes))
			for i, v := range req.Value.CommentTypes {
				cts[i] = rule.CommentType{
					ID:          string(v.ID),
					No:          v.No,
					Name:        v.Name,
					Description: v.Description,
					Color:       v.Color,
				}
			}
			ctps := make([]rule.CommentTypePath, len(req.Value.CommentTypePaths))
			for i, v := range req.Value.CommentTypePaths {
				ctps[i] = rule.CommentTypePath{
					ChildCommentTypeID:  string(v.ChildCommentTypeId),
					ParentCommentTypeID: string(v.ParentCommentTypeId),
				}
			}
			item, err = u.CreateRule(user.CreateRuleParams{
				Name:             req.Value.Name,
				Description:      req.Value.Description,
				CommentTypes:     cts,
				CommentTypePaths: ctps,
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
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			return u.DeleteRule(user.DeleteRuleParams{
				RuleID: string(params.RuleId),
			})
		},
	)
}

func (h *appHandler) RulesRuleIdGet(ctx context.Context, params oas.RulesRuleIdGetParams) (*oas.Rule, error) {
	var item *rule.Rule
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) RulesRuleIdPut(ctx context.Context, req oas.OptRulesRuleIdPutReq, params oas.RulesRuleIdPutParams) (*oas.Rule, error) {
	var item *rule.Rule
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			cts := make([]rule.CommentType, len(req.Value.CommentTypes))
			for i, v := range req.Value.CommentTypes {
				cts[i] = rule.CommentType{
					ID:          string(v.ID),
					No:          v.No,
					Name:        v.Name,
					Description: v.Description,
					Color:       v.Color,
				}
			}
			ctps := make([]rule.CommentTypePath, len(req.Value.CommentTypePaths))
			for i, v := range req.Value.CommentTypePaths {
				ctps[i] = rule.CommentTypePath{
					ChildCommentTypeID:  string(v.ChildCommentTypeId),
					ParentCommentTypeID: string(v.ParentCommentTypeId),
				}
			}
			item, err = u.UpdateRule(user.UpdateRuleParams{
				RuleID:           string(params.RuleId),
				Name:             req.Value.Name,
				Description:      req.Value.Description,
				CommentTypes:     cts,
				CommentTypePaths: ctps,
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
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) DiscussionsPost(ctx context.Context, req oas.OptDiscussionsPostReq) (*oas.Discussion, error) {
	var item *discussion.Discussion
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.CreateDiscussion(user.CreateDiscussionParams{
				Theme:                  req.Value.Theme,
				Background:             req.Value.Background,
				Conclusion:             req.Value.Conclusion,
				RuleID:                 string(req.Value.RuleId),
				VisibilityLevel:        discussion.VisibilityLevel(req.Value.VisibilityLevel),
				CommentPermissionLevel: discussion.CommentPermissionLevel(req.Value.CommentPermissionLevel),
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
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			return u.DeleteDiscussion(user.DeleteDiscussionParams{
				DiscussionID: string(params.DiscussionId),
			})
		},
	)
}

func (h *appHandler) DiscussionsDiscussionIdGet(ctx context.Context, params oas.DiscussionsDiscussionIdGetParams) (*oas.Discussion, error) {
	var item *discussion.Discussion
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) DiscussionsDiscussionIdPut(ctx context.Context, req oas.OptDiscussionsDiscussionIdPutReq, params oas.DiscussionsDiscussionIdPutParams) (*oas.Discussion, error) {
	var item *discussion.Discussion
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.UpdateDiscussion(user.UpdateDiscussionParams{
				DiscussionID:           string(params.DiscussionId),
				Theme:                  req.Value.Theme,
				Background:             req.Value.Background,
				Conclusion:             req.Value.Conclusion,
				RuleID:                 string(req.Value.RuleId),
				VisibilityLevel:        discussion.VisibilityLevel(req.Value.VisibilityLevel),
				CommentPermissionLevel: discussion.CommentPermissionLevel(req.Value.CommentPermissionLevel),
				Status:                 discussion.Status(req.Value.Status),
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
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) DiscussionsDiscussionIdCommentsPost(ctx context.Context, req oas.OptDiscussionsDiscussionIdCommentsPostReq, params oas.DiscussionsDiscussionIdCommentsPostParams) (*oas.Comment, error) {
	var item *discussion.Comment
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.CreateComment(user.CreateCommentParams{
				DiscussionID:    string(params.DiscussionId),
				ParentCommentID: req.Value.ParentCommentId,
				CommentTypeID:   string(req.Value.CommentTypeId),
				Content:         req.Value.Content,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdCommentsCommentIdPut(ctx context.Context, req oas.OptDiscussionsDiscussionIdCommentsCommentIdPutReq, params oas.DiscussionsDiscussionIdCommentsCommentIdPutParams) (*oas.Comment, error) {
	var item *discussion.Comment
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.UpdateComment(user.UpdateCommentParams{
				DiscussionID:  string(params.DiscussionId),
				CommentID:     string(params.CommentId),
				Content:       req.Value.Content,
				CommentStatus: discussion.CommentStatus(req.Value.Status),
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
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			return u.DeleteComment(user.DeleteCommentParams{
				DiscussionID: string(params.DiscussionId),
				CommentID:    string(params.CommentId),
			})
		},
	)
}

func (h *appHandler) DiscussionsDiscussionIdIssuesGet(ctx context.Context, params oas.DiscussionsDiscussionIdIssuesGetParams) ([]oas.Issue, error) {
	var items []*discussion.Issue
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) DiscussionsDiscussionIdIssuesPost(ctx context.Context, req oas.OptDiscussionsDiscussionIdIssuesPostReq, params oas.DiscussionsDiscussionIdIssuesPostParams) (*oas.Issue, error) {
	var item *discussion.Issue
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.CreateIssue(user.CreateIssueParams{
				DiscussionID: string(params.DiscussionId),
				CommentID:    string(req.Value.CommentId),
				IssueType:    discussion.IssueType(req.Value.IssueType),
				Description:  req.Value.Description,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasIssue(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdIssuesIssueIdPut(ctx context.Context, req oas.OptDiscussionsDiscussionIdIssuesIssueIdPutReq, params oas.DiscussionsDiscussionIdIssuesIssueIdPutParams) (*oas.Issue, error) {
	var item *discussion.Issue
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.UpdateIssue(user.UpdateIssueParams{
				DiscussionID: string(params.DiscussionId),
				IssueID:      string(params.IssueId),
				IssueType:    discussion.IssueType(req.Value.IssueType),
				Description:  req.Value.Description,
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
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			return u.DeleteIssue(user.DeleteIssueParams{
				DiscussionID: string(params.DiscussionId),
				IssueID:      string(params.IssueId),
			})
		},
	)
}

func (h *appHandler) DiscussionsDiscussionIdNotesGet(ctx context.Context, params oas.DiscussionsDiscussionIdNotesGetParams) ([]oas.Note, error) {
	var items []*discussion.Note
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
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

func (h *appHandler) DiscussionsDiscussionIdNotesPost(ctx context.Context, req oas.OptDiscussionsDiscussionIdNotesPostReq, params oas.DiscussionsDiscussionIdNotesPostParams) (*oas.Note, error) {
	var item *discussion.Note
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.CreateNote(user.CreateNoteParams{
				DiscussionID: string(params.DiscussionId),
				Content:      req.Value.Content,
			})
			return err
		},
	); err != nil {
		return nil, err
	}
	res := h.toOasNote(item)
	return &res, nil
}

func (h *appHandler) DiscussionsDiscussionIdNotesNoteIdPut(ctx context.Context, req oas.OptDiscussionsDiscussionIdNotesNoteIdPutReq, params oas.DiscussionsDiscussionIdNotesNoteIdPutParams) (*oas.Note, error) {
	var item *discussion.Note
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			item, err = u.UpdateNote(user.UpdateNoteParams{
				DiscussionID: string(params.DiscussionId),
				NoteID:       string(params.NoteId),
				Content:      req.Value.Content,
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
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			return u.DeleteNote(user.DeleteNoteParams{
				DiscussionID: string(params.DiscussionId),
				NoteID:       string(params.NoteId),
			})
		},
	)
}

func (h *appHandler) loadAccount(ctx context.Context, con *Container) *user.User {
	au := userFromContext(ctx)
	return con.UserFac.Build(user.BuildParams{
		ID:    au.ID,
		Email: au.Email,
	})
}

func (h *appHandler) toOasWorkbook(item *workbook.Workbook) oas.Workbook {
	return oas.Workbook{
		ID:     item.ID(),
		Title:  item.Title(),
		Status: oas.Status(item.Status()),
	}
}

func (h *appHandler) toOasProject(item *project.Project) oas.Project {
	return oas.Project{
		ID:        item.ID(),
		Name:      item.Name(),
		CreatedBy: item.CreatedBy(),
		CreatedAt: item.CreatedAt(),
	}
}

func (h *appHandler) toOasRule(item *rule.Rule) oas.Rule {
	cts := make([]oas.CommentType, len(item.CommentTypes()))
	for i, v := range item.CommentTypes() {
		cts[i] = oas.CommentType{
			ID:          v.ID,
			No:          v.No,
			Name:        v.Name,
			Description: v.Description,
			Color:       v.Color,
		}
	}
	ctps := make([]oas.CommentTypePath, len(item.CommentTypePaths()))
	for i, v := range item.CommentTypePaths() {
		ctps[i] = oas.CommentTypePath{
			ChildCommentTypeId:  v.ChildCommentTypeID,
			ParentCommentTypeId: v.ParentCommentTypeID,
		}
	}
	return oas.Rule{
		ID:               item.ID(),
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
		ID:                     item.ID(),
		Theme:                  item.Theme(),
		Background:             item.Background(),
		Conclusion:             item.Conclusion(),
		RuleId:                 item.RuleID(),
		VisibilityLevel:        oas.VisibilityLevel(item.VisibilityLevel()),
		CommentPermissionLevel: oas.CommentPermissionLevel(item.CommentPermissionLevel()),
		CreatedBy:              item.CreatedBy(),
		CreatedAt:              item.CreatedAt(),
		Status:                 oas.DiscussionStatus(item.Status()),
	}
}

func (h *appHandler) toOasComment(item *discussion.Comment) oas.Comment {
	return oas.Comment{
		ID:              item.ID(),
		DiscussionId:    item.DiscussionID(),
		ParentCommentId: item.ParentCommentID(),
		CommentTypeId:   item.CommentTypeID(),
		Content:         item.Content(),
		PostedBy:        item.PostedBy(),
		PostedAt:        item.PostedAt(),
		Status:          oas.CommentStatus(item.Status()),
	}
}

func (h *appHandler) toOasIssue(item *discussion.Issue) oas.Issue {
	return oas.Issue{
		ID:          item.ID(),
		CommentId:   item.CommentID(),
		IssueType:   oas.IssueIssueType(item.IssueType()),
		Description: item.Description(),
		CreatedBy:   item.CreatedBy(),
		CreatedAt:   item.CreatedAt(),
	}
}

func (h *appHandler) toOasNote(item *discussion.Note) oas.Note {
	return oas.Note{
		ID:           item.ID(),
		DiscussionId: item.DiscussionID(),
		Content:      item.Content(),
		PostedBy:     item.PostedBy(),
		PostedAt:     item.PostedAt(),
	}
}
