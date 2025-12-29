package api

import (
	"context"
	"errors"
	"log/slog"

	"github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/learning/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/pkg-auth/auth"
	"github.com/ogen-go/ogen/ogenerrors"
)

type HandlerParams struct {
	CreateDiscussion *usecase.CreateDiscussionUsecase
	GetDiscussion    *usecase.GetDiscussionUsecase
	ListDiscussions  *usecase.ListDiscussionsUsecase
	UpdateDiscussion *usecase.UpdateDiscussionUsecase
	DeleteDiscussion *usecase.DeleteDiscussionUsecase
	CreateComment    *usecase.CreateCommentUsecase
	ListComments     *usecase.ListCommentsUsecase
	UpdateComment    *usecase.UpdateCommentUsecase
	DeleteComment    *usecase.DeleteCommentUsecase
}

type appHandler struct {
	createDiscussion *usecase.CreateDiscussionUsecase
	getDiscussion    *usecase.GetDiscussionUsecase
	listDiscussions  *usecase.ListDiscussionsUsecase
	updateDiscussion *usecase.UpdateDiscussionUsecase
	deleteDiscussion *usecase.DeleteDiscussionUsecase
	createComment    *usecase.CreateCommentUsecase
	listComments     *usecase.ListCommentsUsecase
	updateComment    *usecase.UpdateCommentUsecase
	deleteComment    *usecase.DeleteCommentUsecase
}

func NewHandler(params HandlerParams) oas.Handler {
	return &appHandler{
		createDiscussion: params.CreateDiscussion,
		getDiscussion:    params.GetDiscussion,
		listDiscussions:  params.ListDiscussions,
		updateDiscussion: params.UpdateDiscussion,
		deleteDiscussion: params.DeleteDiscussion,
		createComment:    params.CreateComment,
		listComments:     params.ListComments,
		updateComment:    params.UpdateComment,
		deleteComment:    params.DeleteComment,
	}
}

func (h *appHandler) LearningDiscussionsGet(ctx context.Context) ([]oas.Discussion, error) {
	items, err := h.listDiscussions.Execute(ctx, httpctx.GetUserID(ctx))
	if err != nil {
		return nil, err
	}

	res := make([]oas.Discussion, len(items))
	for i, item := range items {
		res[i] = h.toOasDiscussion(item)
	}
	return res, nil
}

func (h *appHandler) LearningDiscussionsPost(ctx context.Context, req *oas.LearningDiscussionsPostReq) (*oas.Discussion, error) {
	item, err := h.createDiscussion.Execute(ctx, usecase.CreateDiscussionInput{
		Theme:     req.Theme,
		CreatedBy: httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) LearningDiscussionsDiscussionIdGet(ctx context.Context, params oas.LearningDiscussionsDiscussionIdGetParams) (*oas.Discussion, error) {
	item, err := h.getDiscussion.Execute(ctx, usecase.GetDiscussionInput{
		ID:        params.DiscussionId,
		CreatedBy: httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) LearningDiscussionsDiscussionIdPut(ctx context.Context, req *oas.LearningDiscussionsDiscussionIdPutReq, params oas.LearningDiscussionsDiscussionIdPutParams) (*oas.Discussion, error) {
	item, err := h.updateDiscussion.Execute(ctx, usecase.UpdateDiscussionInput{
		ID:        params.DiscussionId,
		CreatedBy: httpctx.GetUserID(ctx),
		Theme:     req.Theme,
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasDiscussion(item)
	return &res, nil
}

func (h *appHandler) LearningDiscussionsDiscussionIdDelete(ctx context.Context, params oas.LearningDiscussionsDiscussionIdDeleteParams) error {
	return h.deleteDiscussion.Execute(ctx, usecase.DeleteDiscussionInput{
		ID:        params.DiscussionId,
		CreatedBy: httpctx.GetUserID(ctx),
	})
}

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsGet(ctx context.Context, params oas.LearningDiscussionsDiscussionIdCommentsGetParams) ([]oas.Comment, error) {
	items, err := h.listComments.Execute(ctx, usecase.ListCommentsInput{
		DiscussionID: params.DiscussionId,
		UserID:       httpctx.GetUserID(ctx),
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

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsPost(ctx context.Context, req *oas.LearningDiscussionsDiscussionIdCommentsPostReq, params oas.LearningDiscussionsDiscussionIdCommentsPostParams) (*oas.Comment, error) {
	item, err := h.createComment.Execute(ctx, usecase.CreateCommentInput{
		DiscussionID:    params.DiscussionId,
		ParentCommentID: req.ParentCommentId,
		CommentType:     req.CommentType,
		Content:         req.Content,
		PostedBy:        httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsCommentIdPut(ctx context.Context, req *oas.LearningDiscussionsDiscussionIdCommentsCommentIdPutReq, params oas.LearningDiscussionsDiscussionIdCommentsCommentIdPutParams) (*oas.Comment, error) {
	item, err := h.updateComment.Execute(ctx, usecase.UpdateCommentInput{
		ID:           params.CommentId,
		DiscussionID: params.DiscussionId,
		UserID:       httpctx.GetUserID(ctx),
		Content:      req.Content,
	})
	if err != nil {
		return nil, err
	}

	res := h.toOasComment(item)
	return &res, nil
}

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsCommentIdDelete(ctx context.Context, params oas.LearningDiscussionsDiscussionIdCommentsCommentIdDeleteParams) error {
	return h.deleteComment.Execute(ctx, usecase.DeleteCommentInput{
		ID:           params.CommentId,
		DiscussionID: params.DiscussionId,
		UserID:       httpctx.GetUserID(ctx),
	})
}

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := err.Error()
	if errors.Is(err, apperr.ErrUnauthorized) ||
		errors.Is(err, auth.ErrNotFound) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) {
		code = 401
	} else if errors.Is(err, apperr.ErrForbidden) {
		code = 403
	} else if errors.Is(err, apperr.ErrNotFound) {
		code = 404
	} else if errors.Is(err, apperr.ErrConflict) {
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

func (h *appHandler) toOasDiscussion(item *domain.Discussion) oas.Discussion {
	return oas.Discussion{
		ID:    oas.ID(item.ID()),
		Theme: item.Theme(),
	}
}

func (h *appHandler) toOasComment(item *domain.Comment) oas.Comment {
	return oas.Comment{
		ID:              oas.ID(item.ID()),
		DiscussionId:    oas.ID(item.DiscussionID()),
		ParentCommentId: oas.ID(item.ParentCommentID()),
		CommentType:     item.CommentType(),
		Content:         item.Content(),
	}
}
