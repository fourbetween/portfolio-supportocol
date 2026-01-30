import { client } from "../api/client";
import type { Project } from "../model/project";

export class ProjectRepository {
  async list(workspaceId: string): Promise<Project[]> {
    const { data, error } = await client.GET(
      "/v1/workspace/workspaces/{workspaceId}/projects",
      {
        params: { path: { workspaceId } },
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }

  async create(workspaceId: string, name: string): Promise<Project> {
    const { data, error } = await client.POST(
      "/v1/workspace/workspaces/{workspaceId}/projects",
      {
        params: { path: { workspaceId } },
        body: { name },
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    workspaceId: string,
    projectId: string,
    name: string,
  ): Promise<Project> {
    const { data, error } = await client.PUT(
      "/v1/workspace/workspaces/{workspaceId}/projects/{projectId}",
      {
        params: { path: { workspaceId, projectId } },
        body: { name },
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }

  async delete(workspaceId: string, projectId: string): Promise<void> {
    const { error } = await client.DELETE(
      "/v1/workspace/workspaces/{workspaceId}/projects/{projectId}",
      {
        params: { path: { workspaceId, projectId } },
      },
    );
    if (error) throw new Error(error.message);
  }
}

export const projectRepository = new ProjectRepository();
