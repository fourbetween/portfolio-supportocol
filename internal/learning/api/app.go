package api

//go:generate go tool ogen -package oas -target oas -clean -config ./schema/ogen.yml ./schema/openapi.yml

import (
	"context"
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/fourbetween/app-supportocol/internal/learning"
	"github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/google/uuid"
	"github.com/ogen-go/ogen/ogenerrors"
)

type appHandler struct {
	con *learning.APIContainer
}

func NewHandler(con *learning.APIContainer) oas.Handler {
	return &appHandler{con: con}
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsGet(ctx context.Context, params oas.V1LearningWorkspacesWorkspaceIdDiscussionsGetParams) ([]oas.DiscussionSummary, error) {
	items, err := h.con.ListDiscussions.Execute(ctx, httpctx.GetUserID(ctx), params.Archived.Or(false))
	if err != nil {
		return nil, err
	}

	res := make([]oas.DiscussionSummary, len(items))
	for i, item := range items {
		res[i] = h.toOasDiscussionSummary(item)
	}
	return res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsPost(
	ctx context.Context,
	req *oas.V1LearningWorkspacesWorkspaceIdDiscussionsPostReq,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsPostParams,
) (*oas.Discussion, error) {
	item, err := h.con.CreateDiscussion.Execute(ctx, usecase.CreateDiscussionInput{
		Theme:     string(req.Theme),
		Status:    domain.DiscussionStatus(req.Status),
		CreatedBy: httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdGet(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdGetParams,
) (*oas.Discussion, error) {
	item, err := h.con.GetDiscussion.Execute(ctx, usecase.GetDiscussionInput{
		ID:        uuid.UUID(params.DiscussionId).String(),
		CreatedBy: httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdPut(
	ctx context.Context,
	req *oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdPutReq,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdPutParams,
) (*oas.Discussion, error) {
	item, err := h.con.UpdateDiscussion.Execute(ctx, usecase.UpdateDiscussionInput{
		ID:         uuid.UUID(params.DiscussionId).String(),
		CreatedBy:  httpctx.GetUserID(ctx),
		Theme:      string(req.Theme),
		Conclusion: string(req.Conclusion),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdDelete(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdDeleteParams,
) error {
	return h.con.DeleteDiscussion.Execute(ctx, usecase.DeleteDiscussionInput{
		ID:        uuid.UUID(params.DiscussionId).String(),
		CreatedBy: httpctx.GetUserID(ctx),
	})
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdStatusPut(
	ctx context.Context,
	req *oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdStatusPutReq,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdStatusPutParams,
) (*oas.Discussion, error) {
	var commentFrame *domain.CommentFrame
	if cf, ok := req.CommentFrame.Get(); ok {
		paths := make([]domain.CommentPath, len(cf.Paths))
		for i, p := range cf.Paths {
			paths[i] = domain.CommentPath{
				Child:  string(p.Child),
				Parent: string(p.Parent),
			}
		}

		types := make([]string, len(cf.Types))
		for i, t := range cf.Types {
			types[i] = string(t)
		}
		commentFrame = &domain.CommentFrame{
			Types: types,
			Paths: paths,
		}
	}

	item, err := h.con.UpdateDiscussionStatus.Execute(ctx, usecase.UpdateDiscussionStatusInput{
		ID:           uuid.UUID(params.DiscussionId).String(),
		CreatedBy:    httpctx.GetUserID(ctx),
		Status:       string(req.Status),
		CommentFrame: commentFrame,
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdArchivePost(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdArchivePostParams,
) (*oas.Discussion, error) {
	item, err := h.con.ArchiveDiscussion.Execute(ctx, usecase.ArchiveDiscussionInput{
		ID:        uuid.UUID(params.DiscussionId).String(),
		CreatedBy: httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdArchiveDelete(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdArchiveDeleteParams,
) (*oas.Discussion, error) {
	item, err := h.con.UnarchiveDiscussion.Execute(ctx, usecase.UnarchiveDiscussionInput{
		ID:        uuid.UUID(params.DiscussionId).String(),
		CreatedBy: httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGet(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGetParams,
) ([]oas.Comment, error) {
	var since *time.Time
	if params.Since.Set {
		since = &params.Since.Value
	}

	items, err := h.con.ListComments.Execute(ctx, usecase.ListCommentsInput{
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
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

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPost(
	ctx context.Context,
	req *oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPostReq,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPostParams,
) (*oas.Comment, error) {
	var parentCommentID *string
	if !req.ParentCommentId.Null {
		s := uuid.UUID(req.ParentCommentId.Value).String()
		parentCommentID = &s
	}

	item, err := h.con.CreateComment.Execute(ctx, usecase.CreateCommentInput{
		DiscussionID:    uuid.UUID(params.DiscussionId).String(),
		ParentCommentID: parentCommentID,
		CommentType:     string(req.CommentType),
		Content:         string(req.Content),
		CreatedBy:       httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdPut(
	ctx context.Context,
	req *oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdPutReq,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdPutParams,
) (*oas.Comment, error) {
	item, err := h.con.UpdateComment.Execute(ctx, usecase.UpdateCommentInput{
		ID:           uuid.UUID(params.CommentId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       httpctx.GetUserID(ctx),
		CommentType:  string(req.CommentType),
		Content:      string(req.Content),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdDelete(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdDeleteParams,
) error {
	return h.con.DeleteComment.Execute(ctx, usecase.DeleteCommentInput{
		ID:           uuid.UUID(params.CommentId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       httpctx.GetUserID(ctx),
	})
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdStatusPut(
	ctx context.Context,
	req *oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdStatusPutReq,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdStatusPutParams,
) (*oas.Comment, error) {
	item, err := h.con.UpdateCommentStatus.Execute(ctx, usecase.UpdateCommentStatusInput{
		ID:           uuid.UUID(params.CommentId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       httpctx.GetUserID(ctx),
		Status:       string(req.Status),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdArchivePost(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdArchivePostParams,
) (*oas.Comment, error) {
	item, err := h.con.ArchiveComment.Execute(ctx, usecase.ArchiveCommentInput{
		ID:           uuid.UUID(params.CommentId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdArchiveDelete(
	ctx context.Context,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsCommentIdArchiveDeleteParams,
) (*oas.Comment, error) {
	item, err := h.con.UnarchiveComment.Execute(ctx, usecase.UnarchiveCommentInput{
		ID:           uuid.UUID(params.CommentId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGeneratePost(
	ctx context.Context,
	req *oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGeneratePostReq,
	params oas.V1LearningWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGeneratePostParams,
) error {
	var parentCommentID *string
	if !req.ParentCommentId.Null {
		s := uuid.UUID(req.ParentCommentId.Value).String()
		parentCommentID = &s
	}

	return h.con.EnqueueCommentGeneration.Execute(ctx, usecase.GenerateCommentInput{
		DiscussionID:    uuid.UUID(params.DiscussionId).String(),
		ParentCommentID: parentCommentID,
		CommentType:     string(req.CommentType),
		UserID:          httpctx.GetUserID(ctx),
	})
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
	}
	return &oas.ErrorStatusCode{
		StatusCode: code,
		Response: oas.Error{
			Code:    code,
			Message: msg,
		},
	}
}

func (h *appHandler) toOasDiscussionSummary(item *usecase.DiscussionSummary) oas.DiscussionSummary {
	res := oas.DiscussionSummary{
		ID:              oas.ID(uuid.MustParse(item.ID)),
		Theme:           oas.DiscussionTheme(item.Theme),
		Status:          oas.DiscussionStatus(item.Status),
		LastCommentedAt: item.LastCommentedAt,
	}
	if item.ArchivedAt != nil {
		res.ArchivedAt.SetTo(*item.ArchivedAt)
	}
	return res
}

func (h *appHandler) toOasDiscussion(item *domain.Discussion) oas.Discussion {
	res := oas.Discussion{
		ID:         oas.ID(uuid.MustParse(item.ID())),
		Theme:      oas.DiscussionTheme(item.Theme()),
		Conclusion: oas.DiscussionConclusion(item.Conclusion()),
		Status:     oas.DiscussionStatus(item.Status()),
	}
	if item.ArchivedAt() != nil {
		res.ArchivedAt.SetTo(*item.ArchivedAt())
	}
	if ds := item.DialogueSettings(); ds != nil {
		paths := make([]oas.CommentPath, len(ds.CommentFrame.Paths))
		for i, p := range ds.CommentFrame.Paths {
			paths[i] = oas.CommentPath{
				Child:  oas.CommentType(p.Child),
				Parent: oas.CommentType(p.Parent),
			}
		}
		oasTypes := make([]oas.CommentType, len(ds.CommentFrame.Types))
		for i, t := range ds.CommentFrame.Types {
			oasTypes[i] = oas.CommentType(t)
		}
		res.DialogueSettings.SetTo(oas.DialogueSettings{
			CommentFrame: oas.CommentFrame{
				Types: oasTypes,
				Paths: paths,
			},
		})
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

	res := oas.Comment{
		ID:              oas.ID(uuid.MustParse(item.ID())),
		DiscussionId:    oas.ID(uuid.MustParse(item.DiscussionID())),
		ParentCommentId: parentCommentID,
		CommentType:     oas.CommentType(item.CommentType()),
		Content:         oas.CommentContent(item.Content()),
		Status:          oas.CommentStatus(item.Status()),
		CreatedAt:       item.CreatedAt(),
	}
	if item.ArchivedAt() != nil {
		res.ArchivedAt.SetTo(*item.ArchivedAt())
	}
	return res
}
