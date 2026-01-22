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

func (h *appHandler) WorkspaceWorkspaceIdProjectsGet(ctx context.Context, params oas.WorkspaceWorkspaceIdProjectsGetParams) ([]oas.Project, error) {
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

func (h *appHandler) WorkspaceWorkspaceIdProjectsPost(ctx context.Context, req *oas.WorkspaceWorkspaceIdProjectsPostReq, params oas.WorkspaceWorkspaceIdProjectsPostParams) (*oas.Project, error) {
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

func (h *appHandler) WorkspaceWorkspaceIdProjectsProjectIdGet(ctx context.Context, params oas.WorkspaceWorkspaceIdProjectsProjectIdGetParams) (*oas.Project, error) {
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

func (h *appHandler) WorkspaceWorkspaceIdProjectsProjectIdPut(ctx context.Context, req *oas.WorkspaceWorkspaceIdProjectsProjectIdPutReq, params oas.WorkspaceWorkspaceIdProjectsProjectIdPutParams) (*oas.Project, error) {
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

func (h *appHandler) WorkspaceWorkspaceIdProjectsProjectIdDelete(ctx context.Context, params oas.WorkspaceWorkspaceIdProjectsProjectIdDeleteParams) error {
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
