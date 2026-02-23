package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/model"
	"github.com/fourbetween/app-supportocol/internal/workspace/infra/db/schema/app-supportocol/table"
	"github.com/fourbetween/app-supportocol/internal/workspace/usecase"
	"github.com/go-jet/jet/v2/mysql"
	"github.com/go-jet/jet/v2/qrm"
)

// workspaceQueryService is implementation of usecase.WorkspaceQueryService.
type workspaceQueryService struct {
	db *sql.DB
}

func NewWorkspaceQueryService(db *sql.DB) usecase.WorkspaceQueryService {
	return &workspaceQueryService{db: db}
}

type workspaceWithMemberModel struct {
	model.Workspaces
	model.Members
	model.Subscriptions
	model.Plans
}

func (s *workspaceQueryService) ListMyWorkspaces(ctx context.Context, userID string) ([]usecase.WorkspaceWithMember, error) {
	stmt := s.selectWorkspaceWithMember().
		WHERE(table.Members.UserID.EQ(mysql.String(userID))).
		ORDER_BY(table.Workspaces.Name.ASC())

	var dest []workspaceWithMemberModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to list my workspaces: %w", err)
	}

	res := make([]usecase.WorkspaceWithMember, len(dest))
	for i, d := range dest {
		res[i] = d.toUseCase()
	}

	return res, nil
}

func (s *workspaceQueryService) CanAccessWorkspace(ctx context.Context, userID string, workspaceID string) (bool, error) {
	result, err := s.CheckWorkspaceAccess(ctx, userID, workspaceID)
	if err != nil {
		return false, err
	}
	return result.CanAccess, nil
}

func (s *workspaceQueryService) CheckWorkspaceAccess(ctx context.Context, userID string, workspaceID string) (usecase.WorkspaceAccessResult, error) {
	w, err := s.loadMyWorkspaceByID(ctx, userID, workspaceID)
	if err != nil {
		if errors.Is(err, apperr.ErrNotFound) {
			return usecase.WorkspaceAccessResult{}, nil
		}
		return usecase.WorkspaceAccessResult{}, fmt.Errorf("failed to check workspace access: %w", err)
	}
	role := domain.MemberRole(w.MemberRole)
	return usecase.WorkspaceAccessResult{
		CanAccess: true,
		CanManage: role.CanManageWorkspace(),
	}, nil
}

func (s *workspaceQueryService) CanAccessProject(ctx context.Context, userID string, workspaceID string, projectID string) (bool, error) {
	p, err := s.loadMyProjectByID(ctx, userID, workspaceID, projectID)
	if err != nil {
		return false, err
	}
	return p.ID == projectID, nil
}

func (s *workspaceQueryService) IsPersonalWorkspace(ctx context.Context, workspaceID string) (bool, error) {
	stmt := mysql.
		SELECT(table.Workspaces.Type).
		FROM(table.Workspaces).
		WHERE(table.Workspaces.ID.EQ(mysql.String(workspaceID))).
		LIMIT(1)

	var dest model.Workspaces
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return false, apperr.ErrNotFound
		}
		return false, fmt.Errorf("failed to check workspace type: %w", err)
	}

	return dest.Type == "personal", nil
}

func (s *workspaceQueryService) ListFavoriteDiscussions(ctx context.Context, workspaceID string, userID string) ([]usecase.FavoriteDiscussionSummary, error) {
	stmt := mysql.
		SELECT(
			table.Discussions.ID,
			table.Discussions.WorkspaceID,
			table.Discussions.Theme,
			table.Discussions.Status,
			table.Discussions.ArchivedAt,
			table.Discussions.LastCommentedAt,
			table.Discussions.CommentsCount,
			table.Discussions.FavoritesCount,
		).
		FROM(
			table.FavoriteDiscussions.
				INNER_JOIN(table.Discussions, table.FavoriteDiscussions.DiscussionID.EQ(table.Discussions.ID)).
				INNER_JOIN(table.Members, table.FavoriteDiscussions.MemberID.EQ(table.Members.ID)),
		).
		WHERE(
			table.Members.WorkspaceID.EQ(mysql.String(workspaceID)).
				AND(table.Members.UserID.EQ(mysql.String(userID))),
		).
		ORDER_BY(table.FavoriteDiscussions.CreatedAt.DESC())

	var dest []model.Discussions
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		return nil, fmt.Errorf("failed to list favorite discussions: %w", err)
	}

	res := make([]usecase.FavoriteDiscussionSummary, len(dest))
	for i, d := range dest {
		res[i] = usecase.FavoriteDiscussionSummary{
			ID:              d.ID,
			WorkspaceID:     d.WorkspaceID,
			Theme:           d.Theme,
			Status:          d.Status,
			ArchivedAt:      d.ArchivedAt,
			LastCommentedAt: d.LastCommentedAt,
			CommentsCount:   int(d.CommentsCount),
			FavoritesCount:  int(d.FavoritesCount),
		}
	}

	return res, nil
}

func (s *workspaceQueryService) loadMyWorkspaceByID(ctx context.Context, userID string, workspaceID string) (usecase.WorkspaceWithMember, error) {
	stmt := s.selectWorkspaceWithMember().
		WHERE(
			table.Workspaces.ID.EQ(mysql.String(workspaceID)).
				AND(table.Members.UserID.EQ(mysql.String(userID))),
		)

	var dest workspaceWithMemberModel
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return usecase.WorkspaceWithMember{}, apperr.ErrNotFound
		}
		return usecase.WorkspaceWithMember{}, fmt.Errorf("failed to load my workspace by ID: %w", err)
	}
	return dest.toUseCase(), nil
}

func (s *workspaceQueryService) loadMyProjectByID(ctx context.Context, userID string, workspaceID string, projectID string) (model.Projects, error) {
	stmt := s.selectProjectWithMember().
		WHERE(
			table.Projects.ID.EQ(mysql.String(projectID)).
				AND(table.Projects.WorkspaceID.EQ(mysql.String(workspaceID))).
				AND(table.Members.UserID.EQ(mysql.String(userID))),
		)

	var dest model.Projects
	if err := stmt.Query(dbtx.GetExecutor(ctx, s.db), &dest); err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return model.Projects{}, apperr.ErrNotFound
		}
		return model.Projects{}, fmt.Errorf("failed to load my project by ID: %w", err)
	}
	return dest, nil
}

func (m workspaceWithMemberModel) toUseCase() usecase.WorkspaceWithMember {
	return usecase.WorkspaceWithMember{
		WorkspaceID:        m.Workspaces.ID,
		WorkspaceSlug:      m.Workspaces.Slug,
		WorkspaceName:      m.Workspaces.Name,
		WorkspaceType:      m.Workspaces.Type,
		WorkspaceCreatedAt: m.Workspaces.CreatedAt,
		MemberRole:         m.Members.Role,
		MemberCreatedAt:    m.Members.CreatedAt,
		PlanID:             m.Plans.ID,
		PlanName:           m.Plans.Name,
		MonthlyAILimit:     int(m.Plans.MonthlyAiLimit),
		MaxProjects:        int(m.Plans.MaxProjects),
		MaxFavorites:       int(m.Plans.MaxFavorites),
		SubscriptionStatus: m.Subscriptions.Status,
		CurrentPeriodStart: m.Subscriptions.CurrentPeriodStart,
		CurrentPeriodEnd:   m.Subscriptions.CurrentPeriodEnd,
	}
}

func (s *workspaceQueryService) selectWorkspaceWithMember() mysql.SelectStatement {
	return mysql.
		SELECT(
			table.Workspaces.AllColumns,
			table.Members.AllColumns,
			table.Subscriptions.AllColumns,
			table.Plans.AllColumns,
		).
		FROM(
			table.Workspaces.
				INNER_JOIN(table.Members, table.Workspaces.ID.EQ(table.Members.WorkspaceID)).
				INNER_JOIN(table.Subscriptions, table.Workspaces.ID.EQ(table.Subscriptions.WorkspaceID)).
				INNER_JOIN(table.Plans, table.Subscriptions.PlanID.EQ(table.Plans.ID)),
		)
}

func (s *workspaceQueryService) selectProjectWithMember() mysql.SelectStatement {
	return mysql.
		SELECT(
			table.Projects.AllColumns,
		).
		FROM(
			table.Projects.
				INNER_JOIN(table.Members, table.Projects.WorkspaceID.EQ(table.Members.WorkspaceID)),
		)
}
