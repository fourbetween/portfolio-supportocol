import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-card";
import type { LearningCommentCard } from "./comment-card";

describe("learning-comment-card", async () => {
  let elem: LearningCommentCard;

  beforeEach(() => {
    elem = document.createElement(
      "learning-comment-card"
    ) as LearningCommentCard;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("本文が表示されること", async () => {
    elem.comment = {
      id: "1",
      discussionId: "1",
      parentCommentId: "0",
      content: "content",
      commentType: "idea",
      status: "active" as const,
    };
    await expect.element(page.getByText("content")).toBeInTheDocument();
  });
});
