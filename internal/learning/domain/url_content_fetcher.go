package domain

import "context"

type URLContentFetcher interface {
	Fetch(ctx context.Context, url string) (string, error)
}
