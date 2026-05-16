package api

//go:generate go tool ogen -package oas -target oas -clean -config ./schema/ogen.yml ./schema/openapi.yml

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/fourbetween/app-supportocol/internal/dialogue"
	"github.com/fourbetween/app-supportocol/internal/dialogue/api/oas"
	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
	"github.com/fourbetween/app-supportocol/internal/dialogue/usecase"
	"github.com/fourbetween/app-supportocol/internal/pkg/apperr"
	"github.com/fourbetween/app-supportocol/internal/pkg/httpctx"
	"github.com/google/uuid"
	"github.com/ogen-go/ogen/ogenerrors"
)

const (
	readCacheControlHeader        = "public, max-age=0, s-maxage=30, stale-while-revalidate=60"
	commentListCacheControlHeader = "public, max-age=0, s-maxage=10, stale-while-revalidate=30"
	noStoreCacheControlHeader     = "no-store"
)

type appHandler struct {
	con *dialogue.Container
}

func NewHandler(con *dialogue.Container) oas.Handler {
	return &appHandler{con: con}
}

func (h *appHandler) V1DialogueDiscussionsGet(ctx context.Context, params oas.V1DialogueDiscussionsGetParams) (*oas.PaginatedDiscussionSummary, error) {
	paging, err := usecase.NewPaging(
		int(params.Page.Or(oas.Page(usecase.DefaultPage))),
		int(params.PageSize.Or(oas.PageSize(usecase.DefaultPageSize))),
	)
	if err != nil {
		return nil, err
	}

	output, err := h.con.ListDiscussions.Execute(ctx, usecase.ListDiscussionsInput{
		Language: string(params.Language.Or("")),
		Sort:     domain.DiscussionSort(params.Sort),
		Paging:   paging,
	})
	if err != nil {
		return nil, err
	}
	h.setReadCacheControl(ctx, output.Cacheable, readCacheControlHeader)

	return h.toOasPaginatedDiscussionSummary(output, paging), nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsGet(
	ctx context.Context,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsGetParams,
) (*oas.PaginatedDiscussionSummary, error) {
	paging, err := usecase.NewPaging(
		int(params.Page.Or(oas.Page(usecase.DefaultPage))),
		int(params.PageSize.Or(oas.PageSize(usecase.DefaultPageSize))),
	)
	if err != nil {
		return nil, err
	}

	output, err := h.con.ListDiscussions.Execute(ctx, usecase.ListDiscussionsInput{
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      httpctx.GetUserID(ctx),
		Sort:        domain.DiscussionSort(params.Sort),
		Paging:      paging,
	})
	if err != nil {
		return nil, err
	}
	h.setReadCacheControl(ctx, output.Cacheable, readCacheControlHeader)

	return h.toOasPaginatedDiscussionSummary(output, paging), nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdGet(
	ctx context.Context,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdGetParams,
) (*oas.Discussion, error) {
	output, err := h.con.GetDiscussion.Execute(ctx, usecase.GetDiscussionInput{
		ID:          uuid.UUID(params.DiscussionId).String(),
		WorkspaceID: uuid.UUID(params.WorkspaceId).String(),
		UserID:      httpctx.GetUserID(ctx),
	})
	if err != nil {
		return nil, err
	}
	h.setReadCacheControl(ctx, output.Cacheable, readCacheControlHeader)

	res := h.toOasDiscussion(output.Discussion)
	return &res, nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGet(
	ctx context.Context,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsGetParams,
) ([]oas.Comment, error) {
	var since time.Time
	if params.Since.Set {
		since = params.Since.Value
	}

	output, err := h.con.ListComments.Execute(ctx, usecase.ListCommentsInput{
		DiscussionID: uuid.UUID(params.DiscussionId).String(),
		WorkspaceID:  uuid.UUID(params.WorkspaceId).String(),
		UserID:       httpctx.GetUserID(ctx),
		Since:        since,
	})
	if err != nil {
		return nil, err
	}
	h.setReadCacheControl(ctx, output.Cacheable, commentListCacheControlHeader)

	res := make([]oas.Comment, len(output.Items))
	for i, item := range output.Items {
		res[i] = h.toOasComment(item)
	}
	return res, nil
}

func (h *appHandler) V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPost(
	ctx context.Context,
	req *oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPostReq,
	params oas.V1DialogueWorkspacesWorkspaceIdDiscussionsDiscussionIdCommentsPostParams,
) (*oas.Comment, error) {
	var parentCommentID string
	if !req.ParentCommentId.Null {
		parentCommentID = uuid.UUID(req.ParentCommentId.Value).String()
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
	code := http.StatusInternalServerError
	msg := strings.Split(err.Error(), ":")[0]
	var secErr *ogenerrors.SecurityError
	if errors.Is(err, apperr.ErrUnauthenticated) ||
		errors.As(err, &secErr) {
		code = http.StatusUnauthorized
	} else if errors.Is(err, apperr.ErrPermissionDenied) {
		code = http.StatusForbidden
	} else if errors.Is(err, apperr.ErrNotFound) {
		code = http.StatusNotFound
	} else if errors.Is(err, apperr.ErrAlreadyExists) ||
		errors.Is(err, apperr.ErrLimitExceeded) {
		code = http.StatusConflict
	} else if errors.Is(err, apperr.ErrInvalidArgument) {
		code = http.StatusBadRequest
	} else if code == http.StatusInternalServerError {
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

func (h *appHandler) setReadCacheControl(ctx context.Context, cacheable bool, headerValue string) {
	w := httpctx.GetResponseWriter(ctx)
	if w == nil {
		return
	}

	if cacheable {
		w.Header().Set("Cache-Control", headerValue)
		return
	}

	w.Header().Set("Cache-Control", noStoreCacheControlHeader)
	if w.Header().Get("Pragma") == "" {
		w.Header().Set("Pragma", "no-cache")
	}
	if w.Header().Get("Expires") == "" {
		w.Header().Set("Expires", "0")
	}
}

func (h *appHandler) toOasPaginatedDiscussionSummary(output usecase.ListDiscussionsOutput, paging usecase.Paging) *oas.PaginatedDiscussionSummary {
	items := make([]oas.DiscussionSummary, len(output.Items))
	for i, item := range output.Items {
		items[i] = h.toOasDiscussionSummary(item)
	}
	return &oas.PaginatedDiscussionSummary{
		Items:      items,
		TotalCount: output.TotalCount,
		Page:       oas.Page(paging.Page),
		PageSize:   oas.PageSize(paging.PageSize),
	}
}

func (h *appHandler) toOasDiscussionSummary(item usecase.DiscussionSummary) oas.DiscussionSummary {
	res := oas.DiscussionSummary{
		ID:              oas.ID(uuid.MustParse(item.ID)),
		WorkspaceId:     oas.ID(uuid.MustParse(item.WorkspaceID)),
		Theme:           oas.DiscussionTheme(item.Theme),
		Language:        oas.DiscussionLanguage(item.Language),
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
		Language:    oas.DiscussionLanguage(item.Language()),
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
	if t, ok := item.ArchivedAt(); ok {
		res.ArchivedAt.SetTo(t)
	} else {
		res.ArchivedAt.SetToNull()
	}
	return res
}

func (h *appHandler) toOasComment(item *domain.Comment) oas.Comment {
	var parentCommentID oas.NilID
	if id, ok := item.ParentCommentID(); ok {
		parentCommentID.SetTo(oas.ID(uuid.MustParse(id)))
	} else {
		parentCommentID.SetToNull()
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
	if t, ok := item.ArchivedAt(); ok {
		res.ArchivedAt.SetTo(t)
	} else {
		res.ArchivedAt.SetToNull()
	}
	return res
}
