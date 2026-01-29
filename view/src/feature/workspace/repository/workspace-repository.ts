import { client } from "../api/client";
import type { WorkspaceWithMember } from "../model/workspace";

export class WorkspaceRepository {
  async getMyWorkspacesWithMember(): Promise<WorkspaceWithMember[]> {
    const { data, error } = await client.GET("/v1/workspace/me");
    if (error) throw new Error(error.message);
    return data;
  }
}

export const workspaceRepository = new WorkspaceRepository();
