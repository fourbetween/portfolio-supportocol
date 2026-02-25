import { client } from "../api/client";
import type { Project } from "../model/project";

export class ProjectRepository {
  private _cache = new Map<string, Project[]>();

  async list(workspaceId: string): Promise<Project[]> {
    if (this._cache.has(workspaceId)) {
      return this._cache.get(workspaceId)!;
    }
    const { data, error } = await client.GET(
      "/v1/workspace/workspaces/{workspaceId}/projects",
      {
        params: { path: { workspaceId } },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(workspaceId, data);
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
    const projects = this._cache.get(workspaceId);
    if (projects) {
      this._cache.set(workspaceId, [...projects, data]);
    }
    return data;
  }

  async update(
    workspaceId: string,
    projectId: string,
    name: string,
    premise: string,
  ): Promise<Project> {
    const { data, error } = await client.PUT(
      "/v1/workspace/workspaces/{workspaceId}/projects/{projectId}",
      {
        params: { path: { workspaceId, projectId } },
        body: { name, premise },
      },
    );
    if (error) throw new Error(error.message);
    const projects = this._cache.get(workspaceId);
    if (projects) {
      this._cache.set(
        workspaceId,
        projects.map((p) => (p.id === projectId ? data : p)),
      );
    }
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
    const projects = this._cache.get(workspaceId);
    if (projects) {
      this._cache.set(
        workspaceId,
        projects.filter((p) => p.id !== projectId),
      );
    }
  }

  async moveDiscussions(
    workspaceId: string,
    targetProjectId: string,
    discussionIds: string[],
  ): Promise<void> {
    const { error } = await client.POST(
      "/v1/workspace/workspaces/{workspaceId}/projects/{projectId}/discussions/move",
      {
        params: { path: { workspaceId, projectId: targetProjectId } },
        body: { discussionIds },
      },
    );
    if (error) throw new Error(error.message);
  }
}

export const projectRepository = new ProjectRepository();
