import { client } from "../api/client";
import type { Discussion, DiscussionSummary } from "../model/discussion";

export class DiscussionRepository {
  private _cache = new Map<string, Discussion>();

  async list(): Promise<DiscussionSummary[]> {
    const { data, error } = await client.GET("/dialogue/discussions");
    if (error) throw new Error(error.message);
    return data || [];
  }

  async load(id: string): Promise<Discussion> {
    const cached = this._cache.get(id);
    if (cached) return cached;

    const { data, error } = await client.GET(
      "/dialogue/discussions/{discussionId}",
      {
        params: { path: { discussionId: id } },
      }
    );
    if (error) throw new Error(error.message);
    this._cache.set(id, data);
    return data;
  }
}

export const discussionRepository = new DiscussionRepository();
