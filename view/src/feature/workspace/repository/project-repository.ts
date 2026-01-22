import { client } from "../api/client";
import type { Project } from "../model/project";

export class ProjectRepository {
  async list(workspaceId: string): Promise<Project[]> {
    const { data, error } = await client.GET(
      "/workspace/{workspaceId}/projects",
      {
        params: { path: { workspaceId } },
      },
    );
    if (error) throw new Error(error.message);
    return data || [];
  }
}

export const projectRepository = new ProjectRepository();
