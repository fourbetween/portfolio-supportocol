import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { CommentFrame } from "../../model/comment-frame";
import "./comment-frame-detail";

describe("learning-comment-frame-detail", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("CommentFrame の内容が表示されること", async () => {
    const frame: CommentFrame = {
      types: ["質問", "回答"],
      paths: [{ child: "回答", parent: "質問" }],
    };

    render(
      html`
        <learning-comment-frame-detail
          .frame=${frame}
        ></learning-comment-frame-detail>
      `,
      container,
    );
    const element = container.querySelector("learning-comment-frame-detail")!;
    await (element as any).updateComplete;

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

    render(
      html`
        <learning-comment-frame-detail
          .frame=${frame}
        ></learning-comment-frame-detail>
      `,
      container,
    );
    const element = container.querySelector("learning-comment-frame-detail")!;
    await (element as any).updateComplete;

    // 質問（親）が合計2つ表示されていることを確認（Typesセクションに1つ、Pathsセクションに1つ）
    const questions = page.getByText("質問").all();
    expect(questions.length).toBe(2);

    // 子要素のコンテナにボーダーがあることを確認
    const childrenNodes = element.shadowRoot?.querySelector(
      ".children-nodes",
    ) as HTMLElement;
    expect(childrenNodes).not.toBeNull();
    const style = window.getComputedStyle(childrenNodes!);
    expect(style.borderLeft).toContain("dashed");
  });

  it("parent が空文字の時に Root と表示されること", async () => {
    const frame: CommentFrame = {
      types: ["質問", ""],
      paths: [{ child: "質問", parent: "" }],
    };

    render(
      html`
        <learning-comment-frame-detail
          .frame=${frame}
        ></learning-comment-frame-detail>
      `,
      container,
    );
    const element = container.querySelector("learning-comment-frame-detail")!;
    await (element as any).updateComplete;

    // Root が表示されていることを確認（Types と Paths の両方にあるはず）
    const roots = page.getByText("Root").all();
    expect(roots.length).toBeGreaterThanOrEqual(1);
    await expect.element(page.getByText("Root").first()).toBeVisible();
  });
});
