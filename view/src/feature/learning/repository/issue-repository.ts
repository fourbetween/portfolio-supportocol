import { client } from "../api/client";
import type { Issue } from "../model/issue";

export class IssueRepository {
  async list(): Promise<Issue[]> {
    const { data, error } = await client.GET("/v1/learning/issues", {});
    if (error) throw new Error(error.message);
    return data || [];
  }
}
