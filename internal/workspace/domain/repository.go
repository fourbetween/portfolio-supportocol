package domain

import "context"

//go:generate go tool mockgen -package domain -destination ./repository_mock.go . WorkspaceRepository,MemberRepository,ProjectRepository

type (
	WorkspaceRepository interface {
		Load(ctx context.Context, id string) (*Workspace, error)
		LoadBySlug(ctx context.Context, slug string) (*Workspace, error)
		Search(ctx context.Context, params SearchWorkspacesParams) ([]*Workspace, error)
		Save(ctx context.Context, workspace *Workspace) error
		Delete(ctx context.Context, workspace *Workspace) error
	}

	SearchWorkspacesParams struct {
		UserID string
	}

	MemberRepository interface {
		Load(ctx context.Context, workspaceID, userID string) (*Member, error)
		Search(ctx context.Context, params SearchMembersParams) ([]*Member, error)
		Save(ctx context.Context, member *Member) error
		Delete(ctx context.Context, member *Member) error
	}

	SearchMembersParams struct {
		WorkspaceID string
	}

	ProjectRepository interface {
		Load(ctx context.Context, params LoadProjectParams) (*Project, error)
		Search(ctx context.Context, params SearchProjectsParams) ([]*Project, error)
		Save(ctx context.Context, project *Project) error
		Delete(ctx context.Context, project *Project) error
	}

	LoadProjectParams struct {
		ID          string
		WorkspaceID string
	}

	SearchProjectsParams struct {
		WorkspaceID string
	}
)
