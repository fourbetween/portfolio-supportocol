package api

//go:generate go tool ogen -package oas -target oas -clean -config ./schema/ogen.yml ./schema/openapi.yml

import (
	"context"
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/fourbetween/app-supportocol/internal/dialogue"
	"github.com/fourbetween/app-supportocol/internal/dialogue/api/oas"
	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/dialogue/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/google/uuid"
	"github.com/ogen-go/ogen/ogenerrors"
)

type appHandler struct {
	con *dialogue.APIContainer
}

func NewHandler(con *dialogue.APIContainer) oas.Handler {
	return &appHandler{con: con}
}

func (h *appHandler) V1DialogueDiscussionsGet(ctx context.Context) ([]oas.DiscussionSummary, error) {
	items, err := h.con.ListDiscussions.Execute(ctx, usecase.ListDiscussionsInput{})
	if err != nil {
		return nil, err
	}

	res := make([]oas.DiscussionSummary, len(items))
	for i, item := range items {
		res[i] = h.toOasDiscussionSummary(item)
	}
	return res, nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsGet(
	ctx context.Context,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsGetParams,
) ([]oas.DiscussionSummary, error) {
	items, err := h.con.ListDiscussions.Execute(ctx, usecase.ListDiscussionsInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := make([]oas.DiscussionSummary, len(items))
	for i, item := range items {
		res[i] = h.toOasDiscussionSummary(item)
	}
	return res, nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdGet(
	ctx context.Context,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdGetParams,
) (*oas.Discussion, error) {
	item, err := h.con.GetDiscussion.Execute(ctx, usecase.GetDiscussionInput{
		ID:          uuid.UUID(params.DiscussionId).String(),
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGet(
	ctx context.Context,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGetParams,
) ([]oas.Comment, error) {
	var since *time.Time
	if params.Since.Set {
		since = &params.Since.Value
	}

	items, err := h.con.ListComments.Execute(ctx, usecase.ListCommentsInput{
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		UserID:       httpctx.GetUserID(ctx),
		Since:        since,
	})
	if err != nil {
		return nil, err
	}

	res := make([]oas.Comment, len(items))
	for i, item := range items {
		res[i] = h.toOasComment(item)
	}
	return res, nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPost(
	ctx context.Context,
	req *oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPostReq,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPostParams,
) (*oas.Comment, error) {
	var parentCommentID *string
	if !req.ParentCommentId.Null {
		s := uuid.UUID(req.ParentCommentId.Value).String()
		parentCommentID = &s
	}

	item, err := h.con.CreateComment.Execute(ctx, usecase.CreateCommentInput{
		DiscussionID:    uuid.UUID(params.DiscussionId).String(),
		WorkspaceID:     uuid.UUID(params.WorkspaceId).String(),
		ParentCommentID: parentCommentID,
		CommentType:     string(req.CommentType),
		Content:         string(req.Content),
		UserID:          httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdIssuesPost(
	ctx context.Context,
	req *oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdIssuesPostReq,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdIssuesPostParams,
) (*oas.Comment, error) {
	item, err := h.con.AddCommentIssue.Execute(ctx, usecase.AddCommentIssueInput{
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		CommentID:    uuid.UUID(params.CommentId).String(),
		Title:        string(req.Title),
		Description:  string(req.Description),
		UserID:       httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := strings.Split(err.Error(), ":")[0]
	if errors.Is(err, apperr.ErrUnauthenticated) ||
		errors.Is(err, auth.ErrNotFound) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) {
		code = 401
	} else if errors.Is(err, apperr.ErrPermissionDenied) {
		code = 403
	} else if errors.Is(err, apperr.ErrNotFound) {
		code = 404
	} else if errors.Is(err, apperr.ErrAlreadyExists) ||
		errors.Is(err, apperr.ErrLimitExceeded) {
		code = 409
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

func (h *appHandler) toOasDiscussionSummary(item usecase.DiscussionSummary) oas.DiscussionSummary {
	res := oas.DiscussionSummary{
		ID:              oas.ID(uuid.MustParse(item.ID)),
		WorkspaceId:     oas.ID(uuid.MustParse(item.WorkspaceID)),
		Theme:           oas.DiscussionTheme(item.Theme),
		Status:          oas.DiscussionStatus(item.Status),
		LastCommentedAt: item.LastCommentedAt,
		CommentsCount:   item.CommentsCount,
		FavoritesCount:  item.FavoritesCount,
	}
	if item.ArchivedAt != nil {
		res.ArchivedAt.SetTo(*item.ArchivedAt)
	} else {
		res.ArchivedAt.SetToNull()
	}
	return res
}

func (h *appHandler) toOasDiscussion(item *domain.Discussion) oas.Discussion {
	settings := item.Settings()
	commentFrame := settings.CommentFrame

	types := make([]oas.CommentType, len(commentFrame.Types))
	for i, t := range commentFrame.Types {
		types[i] = oas.CommentType(t)
	}

	paths := make([]oas.CommentPath, len(commentFrame.Paths))
	for i, p := range commentFrame.Paths {
		paths[i] = oas.CommentPath{
			Child:  oas.CommentType(p.Child),
			Parent: oas.CommentType(p.Parent),
		}
	}

	res := oas.Discussion{
		ID:          oas.ID(uuid.MustParse(item.ID())),
		WorkspaceId: oas.ID(uuid.MustParse(item.WorkspaceID())),
		Theme:       oas.DiscussionTheme(item.Theme()),
		Premise:     oas.DiscussionPremise(item.Premise()),
		Conclusion:  oas.DiscussionConclusion(item.Conclusion()),
		Status:      oas.DiscussionStatus(item.Status()),
		DialogueSettings: oas.DialogueSettings{
			CommentPermission: oas.PermissionLevel(settings.CommentPermission),
			IssuePermission:   oas.PermissionLevel(settings.IssuePermission),
			CommentFrame: oas.CommentFrame{
				Types: types,
				Paths: paths,
			},
		},
	}
	if item.ArchivedAt() != nil {
		res.ArchivedAt.SetTo(*item.ArchivedAt())
	} else {
		res.ArchivedAt.SetToNull()
	}
	return res
}

func (h *appHandler) toOasComment(item *domain.Comment) oas.Comment {
	var parentCommentID oas.NilID
	if item.ParentCommentID() != nil {
		parentCommentID.SetTo(oas.ID(uuid.MustParse(*item.ParentCommentID())))
	} else {
		parentCommentID.Null = true
	}

	issues := make([]oas.CommentIssue, len(item.Issues()))
	for i, issue := range item.Issues() {
		issues[i] = oas.CommentIssue{
			ID:          oas.ID(uuid.MustParse(issue.ID)),
			Title:       oas.CommentIssueTitle(issue.Title),
			Description: oas.CommentIssueDescription(issue.Description),
		}
	}

	res := oas.Comment{
		ID:              oas.ID(uuid.MustParse(item.ID())),
		DiscussionId:    oas.ID(uuid.MustParse(item.DiscussionID())),
		ParentCommentId: parentCommentID,
		Type:            oas.CommentType(item.Type()),
		Content:         oas.CommentContent(item.Content()),
		Status:          oas.CommentStatus(item.Status()),
		Issues:          issues,
		CreatedAt:       item.CreatedAt(),
	}
	if item.ArchivedAt() != nil {
		res.ArchivedAt.SetTo(*item.ArchivedAt())
	} else {
		res.ArchivedAt.SetToNull()
	}
	return res
}
