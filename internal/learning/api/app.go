package handler

import (
	"context"
	"errors"
	"log/slog"

	"github.com/fourbetween/app-supportocol/internal/learning/api/oas"
	"github.com/fourbetween/app-supportocol/internal/learning/domain"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/fourbetween/pkg-auth/jwt"
	"github.com/ogen-go/ogen/ogenerrors"
)

type appHandler struct {
	con    *container
	jwtSrv jwt.Service
	oas.UnimplementedHandler
}

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := err.Error()
	if errors.Is(err, apperr.ErrUnauthorized) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) {
		code = 401
	}
	if errors.Is(err, apperr.ErrForbidden) {
		code = 403
	}
	if errors.Is(err, apperr.ErrNotFound) {
		code = 404
	}
	if errors.Is(err, apperr.ErrConflict) {
		code = 409
	}
	if code == 500 {
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

func (h *appHandler) loadUserID(ctx context.Context, con *container) (string, error) {
	uid := httpctx.GetUserID(ctx)
	if uid == "" {
		return "", apperr.ErrUnauthorized
	}
	return uid, nil
}
