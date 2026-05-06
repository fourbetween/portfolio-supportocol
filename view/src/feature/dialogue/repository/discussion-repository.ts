import { client } from "../api/client";
import type {
  Discussion,
  DiscussionLanguage,
  DiscussionSort,
  PaginatedDiscussionSummary,
} from "../model/discussion";

export class DiscussionRepository {
  async list(
    sort: DiscussionSort = "lastCommentedAt",
    page = 1,
    pageSize = 20,
    language?: DiscussionLanguage,
  ): Promise<PaginatedDiscussionSummary> {
    const { data, error } = await client.GET("/v1/dialogue/discussions", {
      params: { query: { sort, page, pageSize, language } },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async load(workspaceId: string, discussionId: string): Promise<Discussion> {
    const { data, error } = await client.GET(
      "/v1/dialogue/workspaces/{workspaceId}/discussions/{discussionId}",
      {
        params: { path: { workspaceId, discussionId } },
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }
}

export const discussionRepository = new DiscussionRepository();
