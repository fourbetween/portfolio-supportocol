import { client } from "../api/client";
import type { Comment, CommentStatus } from "../model/comment";

export class CommentRepository {
  private _cache = new Map<string, Comment[]>();

  async list(
    workspaceId: string,
    discussionId: string,
    since?: string,
  ): Promise<Comment[]> {
    if (!since && this._cache.has(discussionId)) {
      return this._cache.get(discussionId)!;
    }

    const { data, error } = await client.GET(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments",
      {
        params: {
          path: { workspaceId, discussionId },
          query: { since },
        },
      },
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
    workspaceId: string,
    discussionId: string,
    body: {
      parentCommentId: string | null;
      commentType: string;
      content: string;
    },
  ): Promise<Comment> {
    const { data, error } = await client.POST(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body,
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(discussionId, [...cached, data]);
    }

    return data;
  }

  async update(
    workspaceId: string,
    discussionId: string,
    commentId: string,
    body: {
      commentType: string;
      content: string;
    },
  ): Promise<Comment> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
        body,
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c)),
      );
    }

    return data;
  }

  async delete(
    workspaceId: string,
    discussionId: string,
    commentId: string,
  ): Promise<void> {
    const { error } = await client.DELETE(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      const idsToRemove = this._collectDescendantIds(cached, commentId);
      idsToRemove.add(commentId);
      this._cache.set(
        discussionId,
        cached.filter((c) => !idsToRemove.has(c.id)),
      );
    }
  }

  async lift(
    workspaceId: string,
    discussionId: string,
    commentId: string,
  ): Promise<void> {
    const { error } = await client.DELETE(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/lift",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      const liftedComment = cached.find((c) => c.id === commentId);
      const grandparentId = liftedComment?.parentCommentId ?? null;
      const directChildren = cached.filter(
        (c) => c.parentCommentId === commentId,
      );
      const updated = cached
        .filter((c) => c.id !== commentId)
        .map((c) => {
          if (directChildren.some((ch) => ch.id === c.id)) {
            return { ...c, parentCommentId: grandparentId };
          }
          return c;
        });
      this._cache.set(discussionId, updated);
    }
  }

  async generateChildren(
    workspaceId: string,
    discussionId: string,
    commentId: string,
    commentType: string,
  ): Promise<Comment[]> {
    const { data, error } = await client.POST(
      "/v1/ai/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/generate",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
        body: { commentType },
      },
    );
    if (error) throw new Error(error.message);

    const comments = data || [];
    const cached = this._cache.get(discussionId);
    if (cached && comments.length > 0) {
      this._cache.set(discussionId, [...cached, ...comments]);
    }

    return comments;
  }

  async generateFromSource(
    workspaceId: string,
    discussionId: string,
    text: string,
    urls: string[],
  ): Promise<Comment[]> {
    const { data, error } = await client.POST(
      "/v1/ai/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/generate",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body: { text, urls },
      },
    );
    if (error) throw new Error(error.message);

    const comments = data || [];
    const cached = this._cache.get(discussionId);
    if (cached && comments.length > 0) {
      this._cache.set(discussionId, [...cached, ...comments]);
    }

    return comments;
  }

  async archive(
    workspaceId: string,
    discussionId: string,
    commentId: string,
  ): Promise<Comment> {
    const { data, error } = await client.POST(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/archive",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c)),
      );
    }

    return data;
  }

  async unarchive(
    workspaceId: string,
    discussionId: string,
    commentId: string,
  ): Promise<Comment> {
    const { data, error } = await client.DELETE(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/archive",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c)),
      );
    }

    return data;
  }

  async updateParent(
    workspaceId: string,
    discussionId: string,
    commentId: string,
    parentCommentId: string | null,
  ): Promise<Comment> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/parent",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
        body: { parentCommentId },
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c)),
      );
    }

    return data;
  }

  async updateStatus(
    workspaceId: string,
    discussionId: string,
    commentId: string,
    status: CommentStatus,
  ): Promise<Comment> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/status",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
        body: { status },
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c)),
      );
    }

    return data;
  }

  async removeIssue(
    workspaceId: string,
    discussionId: string,
    commentId: string,
    issueId: string,
  ): Promise<Comment> {
    const { data, error } = await client.DELETE(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/issues/{issueId}",
      {
        params: {
          path: { workspaceId, discussionId, commentId, issueId },
        },
      },
    );
    if (error) throw new Error(error.message);

    const cached = this._cache.get(discussionId);
    if (cached) {
      this._cache.set(
        discussionId,
        cached.map((c) => (c.id === data.id ? data : c)),
      );
    }

    return data;
  }

  private _collectDescendantIds(
    comments: Comment[],
    rootId: string,
  ): Set<string> {
    const result = new Set<string>();
    const queue = [rootId];

    while (queue.length > 0) {
      const parentId = queue.shift()!;
      for (const comment of comments) {
        if (comment.parentCommentId === parentId && !result.has(comment.id)) {
          result.add(comment.id);
          queue.push(comment.id);
        }
      }
    }

    return result;
  }
}

export const commentRepository = new CommentRepository();
