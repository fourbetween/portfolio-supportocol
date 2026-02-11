import { client } from "../api/client";
import type { FavoriteDiscussionSummary } from "../model/favorite-discussion";

export class FavoriteDiscussionRepository {
  private _cache = new Map<string, FavoriteDiscussionSummary[]>();

  async list(workspaceId: string): Promise<FavoriteDiscussionSummary[]> {
    if (this._cache.has(workspaceId)) {
      return this._cache.get(workspaceId)!;
    }
    const { data, error } = await client.GET(
      "/v1/workspace/workspaces/{workspaceId}/favorites",
      { params: { path: { workspaceId } } },
    );
    if (error) throw new Error(error.message);
    this._cache.set(workspaceId, data);
    return data;
  }

  async favorite(workspaceId: string, discussionId: string): Promise<void> {
    const { error } = await client.PUT(
      "/v1/workspace/workspaces/{workspaceId}/discussions/{discussionId}/favorite",
      { params: { path: { workspaceId, discussionId } } },
    );
    if (error) throw new Error(error.message);
    this._cache.delete(workspaceId);
  }

  async unfavorite(workspaceId: string, discussionId: string): Promise<void> {
    const { error } = await client.DELETE(
      "/v1/workspace/workspaces/{workspaceId}/discussions/{discussionId}/favorite",
      { params: { path: { workspaceId, discussionId } } },
    );
    if (error) throw new Error(error.message);
    this._cache.delete(workspaceId);
  }
}

export const favoriteDiscussionRepository = new FavoriteDiscussionRepository();
