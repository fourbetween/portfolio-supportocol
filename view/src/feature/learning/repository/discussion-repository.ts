import { client } from "../api/client";
import type { CommentFrame } from "../model/comment-frame";
import type { Discussion } from "../model/discussion";

export class DiscussionRepository {
  async list(): Promise<Discussion[]> {
    const { data, error } = await client.GET("/learning/discussions");
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get(discussionId: string): Promise<Discussion> {
    const { data, error } = await client.GET(
      "/learning/discussions/{discussionId}",
      {
        params: {
          path: { discussionId },
        },
      }
    );
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Discussion not found");
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
    return data;
  }

  async update(discussionId: string, theme: string): Promise<Discussion> {
    const { data, error } = await client.PUT(
      "/learning/discussions/{discussionId}",
      {
        params: {
          path: { discussionId },
        },
        body: { theme },
      }
    );
    if (error) throw new Error(error.message);
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
  }
}

export const discussionRepository = new DiscussionRepository();
