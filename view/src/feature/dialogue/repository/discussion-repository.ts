import { client } from "../api/client";
import type { Discussion, DiscussionSummary } from "../model/discussion";

export class DiscussionRepository {
  async list(): Promise<DiscussionSummary[]> {
    const { data, error } = await client.GET("/v1/dialogue/discussions");
    if (error) throw new Error(error.message);
    return data;
  }

  async load(id: string): Promise<Discussion> {
    const { data, error } = await client.GET(
      "/v1/dialogue/discussions/{discussionId}",
      {
        params: { path: { discussionId: id } },
      }
    );
    if (error) throw new Error(error.message);
    return data;
  }
}

export const discussionRepository = new DiscussionRepository();
