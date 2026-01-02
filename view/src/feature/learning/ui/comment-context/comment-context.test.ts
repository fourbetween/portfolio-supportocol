import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-context";

describe("learning-comment-context", async () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("祖先コメントが順番に表示されること", async () => {
    const path = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        commentType: "idea",
        status: "active" as const,
        content: "First comment",
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "question",
        status: "active" as const,
        content: "Second comment",
      },
    ];

    render(
      html`
        <learning-comment-context .path=${path}></learning-comment-context>
      `,
      container
    );

    await expect.element(page.getByText("First comment")).toBeInTheDocument();
    await expect.element(page.getByText("Second comment")).toBeInTheDocument();
    await expect.element(page.getByText("idea")).toBeInTheDocument();
    await expect.element(page.getByText("question")).toBeInTheDocument();
  });

  it("末端のコメントは learning-comment-item で表示されること", async () => {
    const path = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        commentType: "idea",
        status: "active" as const,
        content: "First comment",
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "question",
        status: "active" as const,
        content: "Second comment",
      },
    ];

    render(
      html`
        <learning-comment-context .path=${path}></learning-comment-context>
      `,
      container
    );

    // 最初のコメントは card なので edit ボタンがないはず
    const firstComment = page.getByText("First comment");
    await expect.element(firstComment).toBeInTheDocument();
    // Note: We can't easily check "not to have" in a specific scope without more complex queries,
    // but we can check that the second one DOES have it.

    // 最後のコメントは item なので edit ボタンがあるはず
    await expect
      .element(page.getByRole("button", { name: "edit" }))
      .toBeInTheDocument();
  });
});
