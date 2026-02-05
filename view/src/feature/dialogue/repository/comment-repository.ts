import { client } from "../api/client";
import type { Comment } from "../model/comment";

export class CommentRepository {
  async list(
    workspaceId: string,
    discussionId: string,
    since?: string,
  ): Promise<Comment[]> {
    const { data, error } = await client.GET(
      "/v1/dialogue/workspaces/{workspaceId}/discussions/{discussionId}/comments",
      {
        params: {
          path: { workspaceId, discussionId },
          query: { since },
        },
      },
    );
    if (error) throw new Error(error.message);
    return data;
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
      "/v1/dialogue/workspaces/{workspaceId}/discussions/{discussionId}/comments",
      {
        params: {
          path: { workspaceId, discussionId },
        },
        body,
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }

  async addIssue(
    workspaceId: string,
    discussionId: string,
    commentId: string,
    body: {
      title: string;
      description: string;
    },
  ): Promise<Comment> {
    const { data, error } = await client.POST(
      "/v1/dialogue/workspaces/{workspaceId}/discussions/{discussionId}/comments/{commentId}/issues",
      {
        params: {
          path: { workspaceId, discussionId, commentId },
        },
        body,
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }
}

export const commentRepository = new CommentRepository();
