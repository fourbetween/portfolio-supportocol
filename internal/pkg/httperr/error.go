package httperr

import (
	"context"
	"net/http"

	"github.com/go-faster/jx"
	"github.com/ogen-go/ogen/ogenerrors"
)

func ErrorHandler(ctx context.Context, w http.ResponseWriter, r *http.Request, err error) {
	code := ogenerrors.ErrorCode(err)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	e := jx.GetEncoder()
	e.ObjStart()
	e.FieldStart("message")
	e.StrEscape(err.Error())
	e.FieldStart("code")
	e.Int(code)
	e.ObjEnd()

	_, _ = w.Write(e.Bytes())
}
