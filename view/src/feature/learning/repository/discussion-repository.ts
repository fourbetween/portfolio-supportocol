import { client } from "../api/client";
import type { CommentFrame } from "../model/comment-frame";
import type { Discussion, DiscussionSummary } from "../model/discussion";

export class DiscussionRepository {
  private _cache = new Map<string, Discussion>();

  async list(
    workspaceId: string,
    projectId: string,
  ): Promise<DiscussionSummary[]> {
    const { data, error } = await client.GET(
      "/v1/learning/workspaces/{workspaceId}/discussions",
      {
        params: {
          path: { workspaceId },
          query: { projectId },
        },
      },
    );
    if (error) throw new Error(error.message);
    return data || [];
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
    return data;
  }

  async update(
    workspaceId: string,
    discussionId: string,
    projectId: string,
    theme: string,
    conclusion: string,
  ): Promise<Discussion> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body: { projectId, theme, conclusion },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    return data;
  }

  async updateStatus(
    workspaceId: string,
    discussionId: string,
    status: Discussion["status"],
    commentFrame?: CommentFrame,
  ): Promise<Discussion> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/status",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body: { status, commentFrame },
      },
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
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
    return data;
  }

  async delete(workspaceId: string, discussionId: string): Promise<void> {
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
  }
}

export const discussionRepository = new DiscussionRepository();
