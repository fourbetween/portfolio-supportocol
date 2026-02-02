import { client } from "../api/client";
import type {
  Comment,
  CommentIssueStatus,
  CommentStatus,
} from "../model/comment";

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
      this._cache.set(
        discussionId,
        cached.filter((c) => c.id !== commentId),
      );
    }
  }

  async generate(
    workspaceId: string,
    discussionId: string,
    body: {
      parentCommentId: string | null;
      commentType: string;
    },
  ): Promise<void> {
    const { error } = await client.POST(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/generate",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body,
      },
    );
    if (error) throw new Error(error.message);
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

  async updateIssueStatus(
    workspaceId: string,
    discussionId: string,
    commentId: string,
    issueId: string,
    status: CommentIssueStatus,
  ): Promise<Comment> {
    const { data, error } = await client.PUT(
      "/v1/learning/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/issues/{issueId}/status",
      {
        params: {
          path: { workspaceId, discussionId, commentId, issueId },
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
}

export const commentRepository = new CommentRepository();
