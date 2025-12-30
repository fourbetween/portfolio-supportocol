import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./discussion-list";
import type { LearningDiscussionList } from "./discussion-list";

describe("learning-discussion-list", async () => {
  let elem: LearningDiscussionList;

  beforeEach(() => {
    elem = document.createElement(
      "learning-discussion-list"
    ) as LearningDiscussionList;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("議論のテーマが表示されること", async () => {
    elem.discussions = [
      { id: "1", theme: "テーマ1" },
      { id: "2", theme: "テーマ2" },
    ];
    await expect.element(page.getByText("テーマ1")).toBeInTheDocument();
    await expect.element(page.getByText("テーマ2")).toBeInTheDocument();
  });
});
