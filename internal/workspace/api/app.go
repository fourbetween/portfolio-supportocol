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

func (h *appHandler) WorkspacesWorkspaceIdProjectsGet(ctx context.Context, params oas.WorkspacesWorkspaceIdProjectsGetParams) ([]oas.Project, error) {
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

func (h *appHandler) WorkspacesWorkspaceIdProjectsPost(ctx context.Context, req *oas.WorkspacesWorkspaceIdProjectsPostReq, params oas.WorkspacesWorkspaceIdProjectsPostParams) (*oas.Project, error) {
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

func (h *appHandler) WorkspacesWorkspaceIdProjectsProjectIdGet(ctx context.Context, params oas.WorkspacesWorkspaceIdProjectsProjectIdGetParams) (*oas.Project, error) {
	uid := httpctx.GetUserID(ctx)

	project, err := h.con.GetProject.Execute(ctx, usecase.GetProjectInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		ProjectID:   uuid.UUID(params.ProjectId).String(),
		UserID:      uid,
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasProject(project)
	return &res, nil
}

func (h *appHandler) WorkspacesWorkspaceIdProjectsProjectIdPut(ctx context.Context, req *oas.WorkspacesWorkspaceIdProjectsProjectIdPutReq, params oas.WorkspacesWorkspaceIdProjectsProjectIdPutParams) (*oas.Project, error) {
	uid := httpctx.GetUserID(ctx)

	project, err := h.con.UpdateProject.Execute(ctx, usecase.UpdateProjectInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		ProjectID:   uuid.UUID(params.ProjectId).String(),
		UserID:      uid,
		Name:        string(req.Name),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasProject(project)
	return &res, nil
}

func (h *appHandler) WorkspacesWorkspaceIdProjectsProjectIdDelete(ctx context.Context, params oas.WorkspacesWorkspaceIdProjectsProjectIdDeleteParams) error {
	uid := httpctx.GetUserID(ctx)

	return h.con.DeleteProject.Execute(ctx, usecase.DeleteProjectInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		ProjectID:   uuid.UUID(params.ProjectId).String(),
		UserID:      uid,
	})
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

func (h *appHandler) toOasProject(p *domain.Project) oas.Project {
	return oas.Project{
		ID:          oas.ID(uuid.MustParse(p.ID())),
		WorkspaceId: oas.ID(uuid.MustParse(p.WorkspaceID())),
		Name:        oas.ProjectName(p.Name()),
		CreatedAt:   p.CreatedAt(),
	}
}
