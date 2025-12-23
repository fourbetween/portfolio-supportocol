package api

import (
	"context"
	"net/http"
)

// Context keys and helpers
type responseWriterKey struct{}
type userIDCtxKey struct{}

func withResponseWriter(ctx context.Context, w http.ResponseWriter) context.Context {
	return context.WithValue(ctx, responseWriterKey{}, w)
}

func getResponseWriter(ctx context.Context) http.ResponseWriter {
	w, _ := ctx.Value(responseWriterKey{}).(http.ResponseWriter)
	return w
}

func withUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDCtxKey{}, userID)
}

func getUserID(ctx context.Context) string {
	uid, _ := ctx.Value(userIDCtxKey{}).(string)
	return uid
}
