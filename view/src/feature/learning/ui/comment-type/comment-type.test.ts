import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-type";
import type { LearningCommentType } from "./comment-type";

describe("learning-comment-type", async () => {
  let elem: LearningCommentType;

  beforeEach(() => {
    elem = document.createElement(
      "learning-comment-type"
    ) as LearningCommentType;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("コメントの種類が表示されること", async () => {
    elem.type = "idea";
    await expect.element(page.getByText("idea")).toBeInTheDocument();
  });
});
