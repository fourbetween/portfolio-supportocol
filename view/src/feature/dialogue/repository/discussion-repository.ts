import { client } from "../api/client";
import type { Discussion } from "../model/discussion";

export class DiscussionRepository {
  async list(): Promise<Discussion[]> {
    const { data, error } = await client.GET("/dialogue/discussions");
    if (error) throw new Error(error.message);
    return data || [];
  }

  async load(id: string): Promise<Discussion> {
    const { data, error } = await client.GET(
      "/dialogue/discussions/{discussionId}",
      {
        params: { path: { discussionId: id } },
      }
    );
    if (error) throw new Error(error.message);
    return data;
  }
}

export const discussionRepository = new DiscussionRepository();
