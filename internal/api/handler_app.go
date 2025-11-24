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
					Name:        v.Name,
					Description: v.Description,
					Color:       v.Color,
				}
			}
			ctps := make([]rule.CommentTypePath, len(req.Value.CommentTypePaths))
			for i, v := range req.Value.CommentTypePaths {
				ctps[i] = rule.CommentTypePath{
					FromCommentTypeID: string(v.FromCommentTypeId),
					ToCommentTypeID:   string(v.ToCommentTypeId),
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
					Name:        v.Name,
					Description: v.Description,
					Color:       v.Color,
				}
			}
			ctps := make([]rule.CommentTypePath, len(req.Value.CommentTypePaths))
			for i, v := range req.Value.CommentTypePaths {
				ctps[i] = rule.CommentTypePath{
					FromCommentTypeID: string(v.FromCommentTypeId),
					ToCommentTypeID:   string(v.ToCommentTypeId),
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

func (h *appHandler) loadAccount(ctx context.Context, con *Container) *user.User {
	au := userFromContext(ctx)
	return con.UserFac.Build(user.BuildParams{
		ID:    au.ID,
		Email: au.Email,
	})
}

func (h *appHandler) toOasWorkbook(item *workbook.Workbook) oas.Workbook {
	return oas.Workbook{
		ID:     oas.ID(item.ID()),
		Title:  item.Title(),
		Status: oas.Status(item.Status()),
	}
}

func (h *appHandler) toOasProject(item *project.Project) oas.Project {
	return oas.Project{
		ID:        oas.ID(item.ID()),
		Name:      item.Name(),
		CreatedBy: oas.ID(item.CreatedBy()),
		CreatedAt: item.CreatedAt(),
	}
}

func (h *appHandler) toOasRule(item *rule.Rule) oas.Rule {
	cts := make([]oas.CommentType, len(item.CommentTypes()))
	for i, v := range item.CommentTypes() {
		cts[i] = oas.CommentType{
			ID:          oas.ID(v.ID),
			Name:        v.Name,
			Description: v.Description,
			Color:       v.Color,
		}
	}
	ctps := make([]oas.CommentTypePath, len(item.CommentTypePaths()))
	for i, v := range item.CommentTypePaths() {
		ctps[i] = oas.CommentTypePath{
			FromCommentTypeId: oas.ID(v.FromCommentTypeID),
			ToCommentTypeId:   oas.ID(v.ToCommentTypeID),
		}
	}
	return oas.Rule{
		ID:               oas.ID(item.ID()),
		Name:             item.Name(),
		Description:      item.Description(),
		CreatedBy:        oas.ID(item.CreatedBy()),
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
		CreatedBy:              oas.ID(item.CreatedBy()),
		CreatedAt:              item.CreatedAt(),
		Status:                 oas.DiscussionStatus(item.Status()),
	}
}
