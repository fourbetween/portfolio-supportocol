import { client } from "../api/client";
import type { Comment } from "../model/comment";

export class CommentRepository {
  private _cache = new Map<string, Comment[]>();

  async list(discussionId: string, since?: string): Promise<Comment[]> {
    if (!since && this._cache.has(discussionId)) {
      return this._cache.get(discussionId)!;
    }

    const { data, error } = await client.GET(
      "/learning/discussions/{discussionId}/comments",
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
      "/learning/discussions/{discussionId}/comments",
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

  async update(
    discussionId: string,
    commentId: string,
    body: {
      commentType: string;
      content: string;
    }
  ): Promise<Comment> {
    const { data, error } = await client.PUT(
      "/learning/discussions/{discussionId}/comments/{commentId}",
      {
        params: {
          path: { discussionId, commentId },
        },
        body,
      }
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c))
      );
    }

    return data;
  }

  async delete(discussionId: string, commentId: string): Promise<void> {
    const { error } = await client.DELETE(
      "/learning/discussions/{discussionId}/comments/{commentId}",
      {
        params: {
          path: { discussionId, commentId },
        },
      }
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.filter((c) => c.id !== commentId)
      );
    }
  }

  async generate(
    discussionId: string,
    body: {
      parentCommentId: string | null;
      commentType: string;
    }
  ): Promise<void> {
    const { error } = await client.POST(
      "/learning/discussions/{discussionId}/comments/generate",
      {
        params: {
          path: { discussionId },
        },
        body,
      }
    );
    if (error) throw new Error(error.message);
  }

  async updateStatus(
    discussionId: string,
    commentId: string,
    status: "active" | "proposed"
  ): Promise<Comment> {
    const { data, error } = await client.PUT(
      "/learning/discussions/{discussionId}/comments/{commentId}/status",
      {
        params: {
          path: { discussionId, commentId },
        },
        body: { status },
      }
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c))
      );
    }

    return data;
  }
}

export const commentRepository = new CommentRepository();
