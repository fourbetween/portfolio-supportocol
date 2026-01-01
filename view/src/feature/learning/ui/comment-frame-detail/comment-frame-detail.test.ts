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
  });

  it("同じ親を持つパスがグループ化されて表示されること", async () => {
    const frame: CommentFrame = {
      types: ["質問", "回答", "補足"],
      paths: [
        { child: "回答", parent: "質問" },
        { child: "補足", parent: "質問" },
      ],
    };

    (element as any).frame = frame;
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 質問（親）が1つだけ表示されていることを確認（Pathsセクション内）
    const pathsSection = page.getByText("Paths").element().parentElement!;
    const badges = Array.from(
      pathsSection.querySelectorAll("learning-comment-type-badge")
    );
    const parentBadges = badges.filter((el) =>
      el.shadowRoot?.textContent?.includes("質問")
    );

    // 現状の実装だと2つ（各パスに1つずつ）表示されるはずなので、これが1つになることを期待するテストにする
    expect(parentBadges.length).toBe(1);

    // 子要素のコンテナにボーダーがあることを確認
    const childrenNodes = pathsSection.querySelector(
      ".children-nodes"
    ) as HTMLElement;
    expect(childrenNodes).not.toBeNull();
    const style = window.getComputedStyle(childrenNodes);
    expect(style.borderLeft).toContain("dashed");
  });
});
