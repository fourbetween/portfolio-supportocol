import { client } from "../api/client";
import type { Comment } from "../model/comment";

export class CommentRepository {
  async list(discussionId: string, since?: string): Promise<Comment[]> {
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
    return data || [];
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
    return data;
  }
}

export const commentRepository = new CommentRepository();
