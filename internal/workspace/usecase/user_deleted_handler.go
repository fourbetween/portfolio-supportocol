package usecase

import (
	"context"
	"errors"
	"log/slog"

	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/dbtx"
	"github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type UserDeletedHandler struct {
	workspaceRepo domain.WorkspaceRepository
	memberRepo    domain.MemberRepository
	tx            dbtx.Manager
}

func NewUserDeletedHandler(
	workspaceRepo domain.WorkspaceRepository,
	memberRepo domain.MemberRepository,
	tx dbtx.Manager,
) *UserDeletedHandler {
	return &UserDeletedHandler{
		workspaceRepo: workspaceRepo,
		memberRepo:    memberRepo,
		tx:            tx,
	}
}

func (h *UserDeletedHandler) OnUserDeleted(ctx context.Context, userID string) error {
	memberships, err := h.memberRepo.Search(ctx, domain.SearchMembersParams{
		UserID: userID,
	})
	if err != nil {
		slog.Error("failed to search memberships for user", "userID", userID, "error", err)
		return err
	}

	for _, member := range memberships {
		if err := h.memberRepo.Delete(ctx, member); err != nil {
			return err
		}

		count, err := h.memberRepo.CountByWorkspaceID(ctx, member.WorkspaceID())
		if err != nil {
			return err
		}

		if count == 0 {
			workspace, err := h.workspaceRepo.Load(ctx, member.WorkspaceID())
			if err != nil {
				if errors.Is(err, apperr.ErrNotFound) {
					continue
				}
				return err
			}
			if err := h.workspaceRepo.Delete(ctx, workspace); err != nil {
				return err
			}
		}
	}
	return nil
}
