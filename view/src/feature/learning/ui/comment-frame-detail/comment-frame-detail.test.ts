import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { CommentFrame } from "../../model/comment-frame";
import "./comment-frame-detail";

describe("learning-comment-frame-detail", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("learning-comment-frame-detail");
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it("CommentFrame の内容が表示されること", async () => {
    const frame: CommentFrame = {
      types: ["質問", "回答"],
      paths: [{ child: "回答", parent: "質問" }],
    };

    (element as any).frame = frame;
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for render

    await expect.element(page.getByText("Types")).toBeVisible();
    await expect.element(page.getByText("Paths")).toBeVisible();
    await expect.element(page.getByText("質問").first()).toBeVisible();
    await expect.element(page.getByText("回答").first()).toBeVisible();
    await expect.element(page.getByText("arrow_forward")).toBeVisible();
  });
});
