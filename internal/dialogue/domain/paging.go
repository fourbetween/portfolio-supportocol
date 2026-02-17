package domain

import "github.com/fourbetween/app-supportocol/internal/pkg/apperr"

const (
	DefaultPage     = 1
	DefaultPageSize = 20
	MaxPageSize     = 100
)

type Paging struct {
	Page     int
	PageSize int
}

func NewPaging(page, pageSize int) (Paging, error) {
	if page < 1 {
		return Paging{}, apperr.ErrInvalidArgument
	}
	if pageSize < 1 || pageSize > MaxPageSize {
		return Paging{}, apperr.ErrInvalidArgument
	}
	return Paging{Page: page, PageSize: pageSize}, nil
}

func (p Paging) Offset() int {
	return (p.Page - 1) * p.PageSize
}

func (p Paging) Limit() int {
	return p.PageSize
}
