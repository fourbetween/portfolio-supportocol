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

type HandlerParams struct {
	CreateDiscussion         *usecase.CreateDiscussionUsecase
	GetDiscussion            *usecase.GetDiscussionUsecase
	ListDiscussions          *usecase.ListDiscussionsUsecase
	UpdateDiscussion         *usecase.UpdateDiscussionUsecase
	UpdateDiscussionStatus   *usecase.UpdateDiscussionStatusUsecase
	DeleteDiscussion         *usecase.DeleteDiscussionUsecase
	CreateComment            *usecase.CreateCommentUsecase
	ListComments             *usecase.ListCommentsUsecase
	UpdateComment            *usecase.UpdateCommentUsecase
	DeleteComment            *usecase.DeleteCommentUsecase
	UpdateCommentStatus      *usecase.UpdateCommentStatusUsecase
	EnqueueCommentGeneration *usecase.EnqueueCommentGenerationUsecase
}

type appHandler struct {
	con *learning.APIContainer
}

func NewHandler(con *learning.APIContainer) oas.Handler {
	return &appHandler{con: con}
}

func (h *appHandler) LearningDiscussionsGet(ctx context.Context) ([]oas.DiscussionSummary, error) {
	items, err := h.con.ListDiscussions.Execute(ctx, httpctx.GetUserID(ctx))
	if err != nil {
		return nil, err
	}

	res := make([]oas.DiscussionSummary, len(items))
	for i, item := range items {
		res[i] = h.toOasDiscussionSummary(item)
	}
	return res, nil
}

func (h *appHandler) LearningDiscussionsPost(
	ctx context.Context,
	req *oas.LearningDiscussionsPostReq,
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

func (h *appHandler) LearningDiscussionsDiscussionIdGet(
	ctx context.Context,
	params oas.LearningDiscussionsDiscussionIdGetParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdPut(
	ctx context.Context,
	req *oas.LearningDiscussionsDiscussionIdPutReq,
	params oas.LearningDiscussionsDiscussionIdPutParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdDelete(
	ctx context.Context,
	params oas.LearningDiscussionsDiscussionIdDeleteParams,
) error {
	return h.con.DeleteDiscussion.Execute(ctx, usecase.DeleteDiscussionInput{
		ID:        uuid.UUID(params.DiscussionId).String(),
		CreatedBy: httpctx.GetUserID(ctx),
	})
}

func (h *appHandler) LearningDiscussionsDiscussionIdStatusPut(
	ctx context.Context,
	req *oas.LearningDiscussionsDiscussionIdStatusPutReq,
	params oas.LearningDiscussionsDiscussionIdStatusPutParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdArchivePost(
	ctx context.Context,
	params oas.LearningDiscussionsDiscussionIdArchivePostParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsGet(
	ctx context.Context,
	params oas.LearningDiscussionsDiscussionIdCommentsGetParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsPost(
	ctx context.Context,
	req *oas.LearningDiscussionsDiscussionIdCommentsPostReq,
	params oas.LearningDiscussionsDiscussionIdCommentsPostParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsCommentIdPut(
	ctx context.Context,
	req *oas.LearningDiscussionsDiscussionIdCommentsCommentIdPutReq,
	params oas.LearningDiscussionsDiscussionIdCommentsCommentIdPutParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsCommentIdDelete(
	ctx context.Context,
	params oas.LearningDiscussionsDiscussionIdCommentsCommentIdDeleteParams,
) error {
	return h.con.DeleteComment.Execute(ctx, usecase.DeleteCommentInput{
		ID:           uuid.UUID(params.CommentId).String(),
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		UserID:       httpctx.GetUserID(ctx),
	})
}

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsCommentIdStatusPut(
	ctx context.Context,
	req *oas.LearningDiscussionsDiscussionIdCommentsCommentIdStatusPutReq,
	params oas.LearningDiscussionsDiscussionIdCommentsCommentIdStatusPutParams,
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

func (h *appHandler) LearningDiscussionsDiscussionIdCommentsGeneratePost(
	ctx context.Context,
	req *oas.LearningDiscussionsDiscussionIdCommentsGeneratePostReq,
	params oas.LearningDiscussionsDiscussionIdCommentsGeneratePostParams,
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

	return oas.Comment{
		ID:              oas.ID(uuid.MustParse(item.ID())),
		DiscussionId:    oas.ID(uuid.MustParse(item.DiscussionID())),
		ParentCommentId: parentCommentID,
		CommentType:     oas.CommentType(item.CommentType()),
		Content:         oas.CommentContent(item.Content()),
		Status:          oas.CommentStatus(item.Status()),
		CreatedAt:       item.CreatedAt(),
	}
}
