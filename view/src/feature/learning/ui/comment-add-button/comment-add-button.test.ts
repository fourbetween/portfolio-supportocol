import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "./comment-add-button";
import type { LearningCommentAddButton } from "./comment-add-button";

describe("learning-comment-add-button", () => {
  let el: LearningCommentAddButton;

  beforeEach(() => {
    el = document.createElement(
      "learning-comment-add-button"
    ) as LearningCommentAddButton;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el?.remove();
  });

  it("isReply が false の場合、'New Comment' と表示されること", async () => {
    el.isReply = false;
    await el.updateComplete;
    await expect.element(page.getByText("New Comment")).toBeVisible();
  });

  it("isReply が true の場合、'Reply' と表示されること", async () => {
    el.isReply = true;
    await el.updateComplete;
    await expect.element(page.getByText("Reply")).toBeVisible();
  });

  it("クリックされたときに onClick コールバックが実行されること", async () => {
    const handleClick = vi.fn();
    el.onClick = handleClick;
    await el.updateComplete;

    await page.getByRole("button").click();
    expect(handleClick).toHaveBeenCalled();
  });
});
