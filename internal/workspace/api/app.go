package api

//go:generate go tool ogen -package oas -target oas -clean -config ./schema/ogen.yml ./schema/openapi.yml

import (
	"context"
	"errors"
	"log/slog"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/app-supportocol/internal/workspace"
	"github.com/fourbetween/app-supportocol/internal/workspace/api/oas"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
	"github.com/google/uuid"
	"github.com/ogen-go/ogen/ogenerrors"
)

type appHandler struct {
	con *workspace.APIContainer
}

func NewHandler(con *workspace.APIContainer) oas.Handler {
	return &appHandler{
		con: con,
	}
}

func (h *appHandler) V1WorkspaceMeGet(ctx context.Context) ([]oas.WorkspaceWithMember, error) {
	uid := httpctx.GetUserID(ctx)

	workspaces, err := h.con.ListMyWorkspaces.Execute(ctx, uid)
	if err != nil {
		return nil, err
	}

	res := make([]oas.WorkspaceWithMember, len(workspaces))
	for i, w := range workspaces {
		res[i] = h.toOasWorkspaceWithMember(w, uid)
	}

	return res, nil
}

func (h *appHandler) V1WorkspaceWorkspacesWorkspaceIdProjectsGet(
	ctx context.Context,
	params oas.V1WorkspaceWorkspacesWorkspaceIdProjectsGetParams,
) ([]oas.Project, error) {
	uid := httpctx.GetUserID(ctx)

	projects, err := h.con.ListProjects.Execute(ctx, usecase.ListProjectsInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      uid,
	})
	if err != nil {
		return nil, err
	}

	res := make([]oas.Project, len(projects))
	for i, p := range projects {
		res[i] = h.toOasProject(p)
	}

	return res, nil
}

func (h *appHandler) V1WorkspaceWorkspacesWorkspaceIdProjectsPost(
	ctx context.Context,
	req *oas.V1WorkspaceWorkspacesWorkspaceIdProjectsPostReq,
	params oas.V1WorkspaceWorkspacesWorkspaceIdProjectsPostParams,
) (*oas.Project, error) {
	uid := httpctx.GetUserID(ctx)

	project, err := h.con.CreateProject.Execute(ctx, usecase.CreateProjectInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      uid,
		Name:        string(req.Name),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasProject(project)
	return &res, nil
}

func (h *appHandler) V1WorkspaceWorkspacesWorkspaceIdProjectsProjectIdPut(
	ctx context.Context,
	req *oas.V1WorkspaceWorkspacesWorkspaceIdProjectsProjectIdPutReq,
	params oas.V1WorkspaceWorkspacesWorkspaceIdProjectsProjectIdPutParams,
) (*oas.Project, error) {
	uid := httpctx.GetUserID(ctx)

	project, err := h.con.UpdateProject.Execute(ctx, usecase.UpdateProjectInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		ProjectID:   uuid.UUID(params.ProjectId).String(),
		UserID:      uid,
		Name:        string(req.Name),
		Premise:     string(req.Premise),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasProject(project)
	return &res, nil
}

func (h *appHandler) V1WorkspaceWorkspacesWorkspaceIdProjectsProjectIdDelete(
	ctx context.Context,
	params oas.V1WorkspaceWorkspacesWorkspaceIdProjectsProjectIdDeleteParams,
) error {
	uid := httpctx.GetUserID(ctx)

	return h.con.DeleteProject.Execute(ctx, usecase.DeleteProjectInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		ProjectID:   uuid.UUID(params.ProjectId).String(),
		UserID:      uid,
	})
}

func (h *appHandler) V1WorkspaceWorkspacesWorkspaceIdDiscussionsDiscussionIdFavoritePut(
	ctx context.Context,
	params oas.V1WorkspaceWorkspacesWorkspaceIdDiscussionsDiscussionIdFavoritePutParams,
) error {
	uid := httpctx.GetUserID(ctx)

	return h.con.AddFavoriteDiscussion.Execute(ctx, usecase.AddFavoriteDiscussionInput{
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       uid,
	})
}

func (h *appHandler) V1WorkspaceWorkspacesWorkspaceIdDiscussionsDiscussionIdFavoriteDelete(
	ctx context.Context,
	params oas.V1WorkspaceWorkspacesWorkspaceIdDiscussionsDiscussionIdFavoriteDeleteParams,
) error {
	uid := httpctx.GetUserID(ctx)

	return h.con.RemoveFavoriteDiscussion.Execute(ctx, usecase.RemoveFavoriteDiscussionInput{
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       uid,
	})
}

func (h *appHandler) V1WorkspaceWorkspacesWorkspaceIdFavoritesGet(
	ctx context.Context,
	params oas.V1WorkspaceWorkspacesWorkspaceIdFavoritesGetParams,
) ([]oas.FavoriteDiscussionSummary, error) {
	uid := httpctx.GetUserID(ctx)

	summaries, err := h.con.ListFavoriteDiscussions.Execute(ctx, usecase.ListFavoriteDiscussionsInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      uid,
	})
	if err != nil {
		return nil, err
	}

	res := make([]oas.FavoriteDiscussionSummary, len(summaries))
	for i, s := range summaries {
		res[i] = h.toOasFavoriteDiscussionSummary(s)
	}

	return res, nil
}

// Error handling

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := err.Error()
	if errors.Is(err, apperr.ErrUnauthenticated) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) {
		code = 401
	} else if errors.Is(err, apperr.ErrPermissionDenied) {
		code = 403
	} else if errors.Is(err, apperr.ErrNotFound) {
		code = 404
	} else if errors.Is(err, apperr.ErrAlreadyExists) {
		code = 409
	} else if errors.Is(err, apperr.ErrInvalidArgument) {
		code = 400
	} else if code == 500 {
		slog.Error(err.Error())
		msg = "internal server error"
	}
	return &oas.ErrorStatusCode{
		StatusCode: code,
		Response: oas.Error{
			Code:    code,
			Message: msg,
		},
	}
}

// Converters

func (h *appHandler) toOasWorkspaceWithMember(w usecase.WorkspaceWithMember, userID string) oas.WorkspaceWithMember {
	return oas.WorkspaceWithMember{
		Workspace: oas.Workspace{
			ID:        oas.ID(uuid.MustParse(w.WorkspaceID)),
			Slug:      oas.WorkspaceSlug(w.WorkspaceSlug),
			Name:      oas.WorkspaceName(w.WorkspaceName),
			Type:      oas.WorkspaceType(w.WorkspaceType),
			CreatedAt: w.WorkspaceCreatedAt,
		},
		Member: oas.Member{
			WorkspaceId: oas.ID(uuid.MustParse(w.WorkspaceID)),
			UserId:      oas.ID(uuid.MustParse(userID)),
			Role:        oas.MemberRole(w.MemberRole),
			CreatedAt:   w.MemberCreatedAt,
		},
	}
}

func (h *appHandler) toOasProject(p *domain.Project) oas.Project {
	return oas.Project{
		ID:          oas.ID(uuid.MustParse(p.ID())),
		WorkspaceId: oas.ID(uuid.MustParse(p.WorkspaceID())),
		Name:        oas.ProjectName(p.Name()),
		Premise:     oas.ProjectPremise(p.Premise()),
		IsDefault:   p.IsDefault(),
		CreatedAt:   p.CreatedAt(),
	}
}

func (h *appHandler) toOasFavoriteDiscussionSummary(s usecase.FavoriteDiscussionSummary) oas.FavoriteDiscussionSummary {
	res := oas.FavoriteDiscussionSummary{
		ID:              oas.ID(uuid.MustParse(s.ID)),
		WorkspaceId:     oas.ID(uuid.MustParse(s.WorkspaceID)),
		Theme:           oas.DiscussionTheme(s.Theme),
		Status:          oas.DiscussionStatus(s.Status),
		LastCommentedAt: s.LastCommentedAt,
		CommentsCount:   s.CommentsCount,
		FavoritesCount:  s.FavoritesCount,
	}
	if s.ArchivedAt != nil {
		res.ArchivedAt = oas.NewOptDateTime(*s.ArchivedAt)
	}
	return res
}
