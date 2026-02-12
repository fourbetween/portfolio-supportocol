package domain

import "context"

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
		CountByWorkspaceID(ctx context.Context, workspaceID string) (int, error)
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

	FavoriteDiscussionRepository interface {
		Save(ctx context.Context, fav FavoriteDiscussion) error
		Delete(ctx context.Context, memberID, discussionID string) error
		CountByMemberID(ctx context.Context, memberID string) (int, error)
	}
)
