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

// Workspaces

func (h *appHandler) WorkspacesGet(ctx context.Context) ([]oas.Workspace, error) {
	uid := httpctx.GetUserID(ctx)

	workspaces, err := h.con.ListWorkspaces.Execute(ctx, uid)
	if err != nil {
		return nil, err
	}

	res := make([]oas.Workspace, len(workspaces))
	for i, ws := range workspaces {
		res[i] = h.toOasWorkspace(ws)
	}

	return res, nil
}

func (h *appHandler) WorkspacesPost(ctx context.Context, req *oas.WorkspacesPostReq) (*oas.Workspace, error) {
	uid := httpctx.GetUserID(ctx)

	ws, err := h.con.CreateWorkspace.Execute(ctx, usecase.CreateWorkspaceInput{
		Slug:   string(req.Slug),
		Name:   string(req.Name),
		Type:   domain.WorkspaceType(req.Type),
		UserID: uid,
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasWorkspace(ws)
	return &res, nil
}

func (h *appHandler) WorkspacesWorkspaceIdGet(ctx context.Context, params oas.WorkspacesWorkspaceIdGetParams) (*oas.WorkspaceWithMember, error) {
	uid := httpctx.GetUserID(ctx)

	ws, member, err := h.con.GetWorkspace.Execute(ctx, usecase.GetWorkspaceInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      uid,
	})
	if err != nil {
		return nil, err
	}

	return &oas.WorkspaceWithMember{
		Workspace: h.toOasWorkspace(ws),
		Member:    h.toOasMember(member),
	}, nil
}

func (h *appHandler) WorkspacesWorkspaceIdPut(ctx context.Context, req *oas.WorkspacesWorkspaceIdPutReq, params oas.WorkspacesWorkspaceIdPutParams) (*oas.Workspace, error) {
	uid := httpctx.GetUserID(ctx)

	ws, err := h.con.UpdateWorkspace.Execute(ctx, usecase.UpdateWorkspaceInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      uid,
		Name:        string(req.Name),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasWorkspace(ws)
	return &res, nil
}

func (h *appHandler) WorkspacesWorkspaceIdDelete(ctx context.Context, params oas.WorkspacesWorkspaceIdDeleteParams) error {
	uid := httpctx.GetUserID(ctx)

	return h.con.DeleteWorkspace.Execute(ctx, usecase.DeleteWorkspaceInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      uid,
	})
}

// Members

func (h *appHandler) WorkspacesWorkspaceIdMembersGet(ctx context.Context, params oas.WorkspacesWorkspaceIdMembersGetParams) ([]oas.Member, error) {
	uid := httpctx.GetUserID(ctx)

	members, err := h.con.ListMembers.Execute(ctx, usecase.ListMembersInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      uid,
	})
	if err != nil {
		return nil, err
	}

	res := make([]oas.Member, len(members))
	for i, m := range members {
		res[i] = h.toOasMember(m)
	}

	return res, nil
}

func (h *appHandler) WorkspacesWorkspaceIdMembersPost(ctx context.Context, req *oas.WorkspacesWorkspaceIdMembersPostReq, params oas.WorkspacesWorkspaceIdMembersPostParams) (*oas.Member, error) {
	uid := httpctx.GetUserID(ctx)

	member, err := h.con.AddMember.Execute(ctx, usecase.AddMemberInput{
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		UserID:       uid,
		TargetUserID: uuid.UUID(req.UserId).String(),
		TargetRole:   domain.MemberRole(req.Role),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasMember(member)
	return &res, nil
}

func (h *appHandler) WorkspacesWorkspaceIdMembersUserIdPut(ctx context.Context, req *oas.WorkspacesWorkspaceIdMembersUserIdPutReq, params oas.WorkspacesWorkspaceIdMembersUserIdPutParams) (*oas.Member, error) {
	uid := httpctx.GetUserID(ctx)

	member, err := h.con.UpdateMember.Execute(ctx, usecase.UpdateMemberInput{
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		UserID:       uid,
		TargetUserID: uuid.UUID(params.UserId).String(),
		TargetRole:   domain.MemberRole(req.Role),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasMember(member)
	return &res, nil
}

func (h *appHandler) WorkspacesWorkspaceIdMembersUserIdDelete(ctx context.Context, params oas.WorkspacesWorkspaceIdMembersUserIdDeleteParams) error {
	uid := httpctx.GetUserID(ctx)

	return h.con.RemoveMember.Execute(ctx, usecase.RemoveMemberInput{
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		UserID:       uid,
		TargetUserID: uuid.UUID(params.UserId).String(),
	})
}

// Projects

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

func (h *appHandler) toOasWorkspace(ws *domain.Workspace) oas.Workspace {
	return oas.Workspace{
		ID:        oas.ID(uuid.MustParse(ws.ID())),
		Slug:      oas.WorkspaceSlug(ws.Slug()),
		Name:      oas.WorkspaceName(ws.Name()),
		Type:      oas.WorkspaceType(ws.Type()),
		CreatedAt: ws.CreatedAt(),
	}
}

func (h *appHandler) toOasMember(m *domain.Member) oas.Member {
	return oas.Member{
		WorkspaceId: oas.ID(uuid.MustParse(m.WorkspaceID())),
		UserId:      oas.ID(uuid.MustParse(m.UserID())),
		Role:        oas.MemberRole(m.Role()),
		CreatedAt:   m.CreatedAt(),
	}
}

func (h *appHandler) toOasProject(p *domain.Project) oas.Project {
	return oas.Project{
		ID:          oas.ID(uuid.MustParse(p.ID())),
		WorkspaceId: oas.ID(uuid.MustParse(p.WorkspaceID())),
		Name:        oas.ProjectName(p.Name()),
		CreatedAt:   p.CreatedAt(),
	}
}
