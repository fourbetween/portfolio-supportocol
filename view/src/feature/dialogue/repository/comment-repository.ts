import { client } from "../api/client";
import type { Comment } from "../model/comment";

export class CommentRepository {
  async list(discussionId: string, since?: string): Promise<Comment[]> {
    const { data, error } = await client.GET(
      "/v1/dialogue/discussions/{discussionId}/comments",
      {
        params: {
          path: { discussionId },
          query: { since },
        },
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }

  async create(
    discussionId: string,
    body: {
      parentCommentId: string | null;
      commentType: string;
      content: string;
    },
  ): Promise<Comment> {
    const { data, error } = await client.POST(
      "/v1/dialogue/discussions/{discussionId}/comments",
      {
        params: {
          path: { discussionId },
        },
        body,
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }
}

export const commentRepository = new CommentRepository();
