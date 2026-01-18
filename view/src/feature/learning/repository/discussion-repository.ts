import { client } from "../api/client";
import type { CommentFrame } from "../model/comment-frame";
import type { Discussion, DiscussionSummary } from "../model/discussion";

export class DiscussionRepository {
  private _cache = new Map<string, Discussion>();

  async list(archived?: boolean): Promise<DiscussionSummary[]> {
    const { data, error } = await client.GET("/learning/discussions", {
      params: {
        query: { archived },
      },
    });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get(discussionId: string): Promise<Discussion> {
    const cached = this._cache.get(discussionId);
    if (cached) return cached;

    const { data, error } = await client.GET(
      "/learning/discussions/{discussionId}",
      {
        params: {
          path: { discussionId },
        },
      }
    );
    if (error) throw new Error(error.message);
    this._cache.set(discussionId, data);
    return data;
  }

  async create(
    theme: string,
    status: Discussion["status"]
  ): Promise<Discussion> {
    const { data, error } = await client.POST("/learning/discussions", {
      body: { theme, status },
    });
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    return data;
  }

  async update(
    discussionId: string,
    theme: string,
    conclusion: string
  ): Promise<Discussion> {
    const { data, error } = await client.PUT(
      "/learning/discussions/{discussionId}",
      {
        params: {
          path: { discussionId },
        },
        body: { theme, conclusion },
      }
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    return data;
  }

  async updateStatus(
    discussionId: string,
    status: Discussion["status"],
    commentFrame?: CommentFrame
  ): Promise<Discussion> {
    const { data, error } = await client.PUT(
      "/learning/discussions/{discussionId}/status",
      {
        params: {
          path: { discussionId },
        },
        body: { status, commentFrame },
      }
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    return data;
  }

  async archive(discussionId: string): Promise<Discussion> {
    const { data, error } = await client.POST(
      "/learning/discussions/{discussionId}/archive",
      {
        params: {
          path: { discussionId },
        },
      }
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    return data;
  }

  async unarchive(discussionId: string): Promise<Discussion> {
    const { data, error } = await client.DELETE(
      "/learning/discussions/{discussionId}/archive",
      {
        params: {
          path: { discussionId },
        },
      }
    );
    if (error) throw new Error(error.message);
    this._cache.set(data.id, data);
    return data;
  }

  async delete(discussionId: string): Promise<void> {
    const { error } = await client.DELETE(
      "/learning/discussions/{discussionId}",
      {
        params: {
          path: { discussionId },
        },
      }
    );
    if (error) throw new Error(error.message);
    this._cache.delete(discussionId);
  }
}

export const discussionRepository = new DiscussionRepository();
