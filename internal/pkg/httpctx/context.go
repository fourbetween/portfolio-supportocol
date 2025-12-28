package httpctx

import (
	"context"
	"net/http"
)

// Context keys and helpers
type responseWriterKey struct{}
type userIDCtxKey struct{}

func WithResponseWriter(ctx context.Context, w http.ResponseWriter) context.Context {
	return context.WithValue(ctx, responseWriterKey{}, w)
}

func GetResponseWriter(ctx context.Context) http.ResponseWriter {
	w, _ := ctx.Value(responseWriterKey{}).(http.ResponseWriter)
	return w
}

func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDCtxKey{}, userID)
}

func GetUserID(ctx context.Context) string {
	uid, _ := ctx.Value(userIDCtxKey{}).(string)
	return uid
}
