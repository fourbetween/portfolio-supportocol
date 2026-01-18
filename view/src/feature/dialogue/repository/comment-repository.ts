import { client } from "../api/client";
import type { Comment } from "../model/comment";

export class CommentRepository {
  private _cache = new Map<string, Comment[]>();

  async list(discussionId: string, since?: string): Promise<Comment[]> {
    if (!since && this._cache.has(discussionId)) {
      return this._cache.get(discussionId)!;
    }

    const { data, error } = await client.GET(
      "/dialogue/discussions/{discussionId}/comments",
      {
        params: {
          path: { discussionId },
          query: { since },
        },
      }
    );
    if (error) throw new Error(error.message);
    const comments = data || [];

    if (!since) {
      this._cache.set(discussionId, comments);
    } else {
      const cached = this._cache.get(discussionId);
      if (cached) {
        const existingIds = new Set(cached.map((c) => c.id));
        const newOnes = comments.filter((c) => !existingIds.has(c.id));
        this._cache.set(discussionId, [...cached, ...newOnes]);
      }
    }

    return comments;
  }

  async create(
    discussionId: string,
    body: {
      parentCommentId: string | null;
      commentType: string;
      content: string;
    }
  ): Promise<Comment> {
    const { data, error } = await client.POST(
      "/dialogue/discussions/{discussionId}/comments",
      {
        params: {
          path: { discussionId },
        },
        body,
      }
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(discussionId, [...cached, data]);
    }

    return data;
  }
}

export const commentRepository = new CommentRepository();
