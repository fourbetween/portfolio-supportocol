package usecase

import (
	"context"
	"fmt"

	"github.com/fourbetween/app-supportocol/internal/dialogue/domain"
)

type ListIssuesUsecase struct {
	repo domain.IssueRepository
}

func NewListIssuesUsecase(repo domain.IssueRepository) *ListIssuesUsecase {
	return &ListIssuesUsecase{
		repo: repo,
	}
}

func (u *ListIssuesUsecase) Execute(ctx context.Context) ([]*domain.Issue, error) {
	issues, err := u.repo.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list issues: %w", err)
	}
	return issues, nil
}
