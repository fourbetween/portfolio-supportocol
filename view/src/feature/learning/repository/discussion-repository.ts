import { client } from "../api/client";
import type {
  DialogueSettings,
  Discussion,
  DiscussionSummary,
} from "../model/discussion";

export class DiscussionRepository {
  private _cache = new Map<string, Discussion>();
  private _listCache = new Map<string, DiscussionSummary[]>();

  private _getListCacheKey(
    workspaceId: string,
    projectId: string,
    archived?: boolean,
  ): string {
    return `${workspaceId}:${projectId}:${!!archived}`;
  }

  private _clearListCache(workspaceId: string, projectId: string) {
    this._listCache.delete(this._getListCacheKey(workspaceId, projectId, true));
    this._listCache.delete(
      this._getListCacheKey(workspaceId, projectId, false),
    );
  }

  async list(
    workspaceId: string,
    projectId: string,
    archived?: boolean,
  ): Promise<DiscussionSummary[]> {
    const key = this._getListCacheKey(workspaceId, projectId, archived);
    const cached = this._listCache.get(key);
    if (cached) return cached;

    const { data, error } = await client.GET(
      "/v1/learning/workspaces/{workspaceId}/discussions",
      {
        params: {
          path: { workspaceId },
          query: { projectId, archived },
        },
      },
    );
    if (error) throw new Error(error.message);
    const result = data || [];
    this._listCache.set(key, result);
    return result;
  }

  async get(workspaceId: string, discussionId: string): Promise<Discussion> {
    const cached = this._cache.get(discussionId);
    if (cached) return cached;

    const { data, error } = await client.GET(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}",
      {
        params: {
          path: { workspaceId, discussionId },
        },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(discussionId, data);
    return data;
  }

  async create(
    workspaceId: string,
    projectId: string,
    theme: string,
    status: Discussion["status"],
  ): Promise<Discussion> {
    const { data, error } = await client.POST(
      "/v1/learning/workspaces/{workspaceId}/discussions",
      {
        params: {
          path: { workspaceId },
        },
        body: { projectId, theme, status },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    this._clearListCache(workspaceId, projectId);
    return data;
  }

  async update(
    workspaceId: string,
    discussionId: string,
    projectId: string,
    theme: string,
    premise: string,
    conclusion: string,
  ): Promise<Discussion> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body: { projectId, theme, premise, conclusion },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    this._clearListCache(workspaceId, projectId);
    return data;
  }

  async updateStatus(
    workspaceId: string,
    discussionId: string,
    status: Discussion["status"],
    dialogueSettings?: DialogueSettings,
  ): Promise<Discussion> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/status",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body: {
          status,
          commentFrame: dialogueSettings?.commentFrame,
          commentPermission: dialogueSettings?.commentPermission,
          issuePermission: dialogueSettings?.issuePermission,
        },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    this._clearListCache(workspaceId, data.projectId);
    return data;
  }

  async archive(
    workspaceId: string,
    discussionId: string,
  ): Promise<Discussion> {
    const { data, error } = await client.POST(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/archive",
      {
        params: {
          path: { workspaceId, discussionId },
        },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    this._clearListCache(workspaceId, data.projectId);
    return data;
  }

  async unarchive(
    workspaceId: string,
    discussionId: string,
  ): Promise<Discussion> {
    const { data, error } = await client.DELETE(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/archive",
      {
        params: {
          path: { workspaceId, discussionId },
        },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    this._clearListCache(workspaceId, data.projectId);
    return data;
  }

  async delete(
    workspaceId: string,
    projectId: string,
    discussionId: string,
  ): Promise<void> {
    const { error } = await client.DELETE(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}",
      {
        params: {
          path: { workspaceId, discussionId },
        },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.delete(discussionId);
    this._clearListCache(workspaceId, projectId);
  }
}

export const discussionRepository = new DiscussionRepository();
