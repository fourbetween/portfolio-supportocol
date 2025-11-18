package api

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/fourbetween/app-supportocol/internal"
	"github.com/fourbetween/app-supportocol/internal/api/oas"
	"github.com/fourbetween/app-supportocol/internal/model/user"
	"github.com/fourbetween/app-supportocol/internal/model/workbook"
	auth "github.com/fourbetween/pkg-auth"
	uow "github.com/fourbetween/pkg-uow"
	"github.com/ogen-go/ogen/ogenerrors"
)

func NewHttpHandler(
	uowSrv uow.UnitOfWork[*Container],
	authSrv auth.Auth,
) (http.Handler, error) {
	app := &appHandler{
		uowSrv: uowSrv,
	}
	sec := &securityHandler{
		authSrv: authSrv,
	}
	return oas.NewServer(app, sec, oas.WithErrorHandler(errorHandler))
}

type appHandler struct {
	uowSrv uow.UnitOfWork[*Container]
}

func (h *appHandler) WorkbooksGet(ctx context.Context) ([]oas.Workbook, error) {
	var items []*workbook.Workbook
	var err error
	if err := h.uowSrv.Do(
		ctx,
		func(con *Container) error {
			u := h.loadAccount(ctx, con)
			items, err = u.SearchWorkbooks()
			return err
		},
	); err != nil {
		return nil, err
	}
	res := make([]oas.Workbook, len(items))
	for i, v := range items {
		res[i] = h.toOasWorkbook(v)
	}
	return res, nil
}

func (h *appHandler) ErrorsPost(ctx context.Context, req *oas.ErrorsPostReq) error {
	slog.Error(
		"frontend error",
		slog.String("message", req.Message),
	)
	return nil
}

func (h *appHandler) NewError(ctx context.Context, err error) *oas.ErrorStatusCode {
	code := 500
	msg := err.Error()
	if errors.Is(err, ErrUnauthorized) ||
		errors.Is(err, ogenerrors.ErrSecurityRequirementIsNotSatisfied) {
		code = 401
	}
	if errors.Is(err, internal.ErrForbidden) {
		code = 403
	}
	if errors.Is(err, internal.ErrNotFound) {
		code = 404
	}
	if errors.Is(err, internal.ErrConflict) {
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

func (h *appHandler) loadAccount(ctx context.Context, con *Container) *user.User {
	au := userFromContext(ctx)
	return con.UserFac.Build(user.BuildParams{
		ID:    au.ID,
		Email: au.Email,
	})
}

func (h *appHandler) toOasWorkbook(item *workbook.Workbook) oas.Workbook {
	return oas.Workbook{
		ID:     oas.ID(item.ID()),
		Title:  item.Title(),
		Status: string(item.Status()),
	}
}
