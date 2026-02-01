package domain

import (
	"github.com/fourbetween/app-supportocol/internal/pkg/id"
)

type IssueFactory struct {
	idSrv id.Service
}

func NewIssueFactory(idSrv id.Service) *IssueFactory {
	return &IssueFactory{
		idSrv: idSrv,
	}
}

type CreateIssueParams struct {
	IssueType   string
	Description string
	Status      IssueStatus
}

func (f *IssueFactory) Create(params CreateIssueParams) (*Issue, error) {
	id := f.idSrv.Generate()
	return f.Reconstruct(ReconstructIssueParams{
		ID:                id,
		CreateIssueParams: params,
	})
}

type ReconstructIssueParams struct {
	ID string
	CreateIssueParams
}

func (f *IssueFactory) Reconstruct(params ReconstructIssueParams) (*Issue, error) {
	i := &Issue{
		id:          params.ID,
		issueType:   params.IssueType,
		description: params.Description,
		status:      params.Status,
	}

	if err := i.Validate(); err != nil {
		return nil, err
	}

	return i, nil
}
