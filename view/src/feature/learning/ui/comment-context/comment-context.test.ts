import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-context";
import type { LearningCommentContext } from "./comment-context";

describe("learning-comment-context", async () => {
  let elem: LearningCommentContext;

  beforeEach(() => {
    elem = document.createElement(
      "learning-comment-context"
    ) as LearningCommentContext;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("祖先コメントが順番に表示されること", async () => {
    elem.ancestors = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        commentType: "idea", status: "active" as const,
        content: "First comment",
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "question", status: "active" as const,
        content: "Second comment",
      },
    ];
    await elem.updateComplete;
    await expect.element(page.getByText("First comment")).toBeInTheDocument();
    await expect.element(page.getByText("Second comment")).toBeInTheDocument();
    await expect.element(page.getByText("idea")).toBeInTheDocument();
    await expect.element(page.getByText("question")).toBeInTheDocument();
  });
});
