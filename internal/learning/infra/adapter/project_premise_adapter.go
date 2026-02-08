package adapter

import (
	"context"

	wsdomain "github.com/fourbetween/app-supportocol/internal/workspace/domain"
)

type ProjectPremiseAdapter struct {
	projectRepo wsdomain.ProjectRepository
}

func NewProjectPremiseAdapter(projectRepo wsdomain.ProjectRepository) *ProjectPremiseAdapter {
	return &ProjectPremiseAdapter{projectRepo: projectRepo}
}

func (a *ProjectPremiseAdapter) GetProjectPremise(ctx context.Context, workspaceID, projectID string) (string, error) {
	project, err := a.projectRepo.Load(ctx, wsdomain.LoadProjectParams{
		ID:          projectID,
		WorkspaceID: workspaceID,
	})
	if err != nil {
		return "", err
	}
	return project.Premise(), nil
}
