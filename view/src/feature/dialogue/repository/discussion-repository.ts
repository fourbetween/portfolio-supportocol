import { client } from "../api/client";
import type { Discussion, DiscussionSummary } from "../model/discussion";

export class DiscussionRepository {
  private _cache = new Map<string, Discussion>();
  private _summaries: DiscussionSummary[] | null = null;

  async list(): Promise<DiscussionSummary[]> {
    if (this._summaries) {
      return this._summaries;
    }

    const { data, error } = await client.GET("/dialogue/discussions");
    if (error) throw new Error(error.message);
    this._summaries = data || [];
    return this._summaries;
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
