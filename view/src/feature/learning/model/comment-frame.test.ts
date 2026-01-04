import { describe, expect, it } from "vitest";
import type { Comment } from "./comment";
import { deriveCommentFrame } from "./comment-frame";

describe("deriveCommentFrame", () => {
  it("コメントの配列から CommentFrame を生成すること", () => {
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        commentType: "Idea",
        content: "idea 1",
        status: "active",
      createdAt: "2026-01-04T00:00:00Z",
        },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "Question",
        content: "question 1",
        status: "active",
      createdAt: "2026-01-04T00:00:00Z",
        },
      {
        id: "3",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "Agree",
        content: "agree 1",
        status: "active",
      createdAt: "2026-01-04T00:00:00Z",
        },
      {
        id: "4",
        discussionId: "d1",
        parentCommentId: "2",
        commentType: "Answer",
        content: "answer 1",
        status: "active",
      createdAt: "2026-01-04T00:00:00Z",
        },
    ];

    const frame = deriveCommentFrame(comments);

    expect(frame.types).toEqual(["Agree", "Answer", "Idea", "Question"]);

    expect(frame.paths).toEqual([
      { child: "Agree", parent: "Idea" },
      { child: "Answer", parent: "Question" },
      { child: "Question", parent: "Idea" },
    ]);
  });
});
