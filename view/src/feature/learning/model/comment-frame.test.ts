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
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "Question",
        content: "question 1",
      },
      {
        id: "3",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "Agree",
        content: "agree 1",
      },
      {
        id: "4",
        discussionId: "d1",
        parentCommentId: "2",
        commentType: "Answer",
        content: "answer 1",
      },
    ];

    const frame = deriveCommentFrame(comments);

    expect(frame.types).toContain("Idea");
    expect(frame.types).toContain("Question");
    expect(frame.types).toContain("Agree");
    expect(frame.types).toContain("Answer");
    expect(frame.types).toHaveLength(4);

    expect(frame.paths).toContainEqual({ child: "Question", parent: "Idea" });
    expect(frame.paths).toContainEqual({ child: "Agree", parent: "Idea" });
    expect(frame.paths).toContainEqual({ child: "Answer", parent: "Question" });
    expect(frame.paths).toHaveLength(3);
  });
});
