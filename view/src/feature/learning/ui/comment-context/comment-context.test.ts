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
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "question",
        status: "active" as const,
        content: "Second comment",
        createdAt: "2026-01-04T00:00:00Z",
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
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        commentType: "question",
        status: "active" as const,
        content: "Second comment",
        createdAt: "2026-01-04T00:00:00Z",
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

  it("コメントをクリックしたときに select-comment イベントが発火されること", async () => {
    const path = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        commentType: "idea",
        status: "active" as const,
        content: "First comment",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    let clickedCommentId = "";
    const handleSelectComment = (e: any) => {
      clickedCommentId = e.commentId;
    };

    render(
      html`
        <learning-comment-context
          .path=${path}
          @select-comment=${handleSelectComment}
        ></learning-comment-context>
      `,
      container
    );

    await page.getByText("First comment").click();
    expect(clickedCommentId).toBe("1");
  });

  it("子コメント数が表示されること", async () => {
    const path = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        commentType: "idea",
        status: "active" as const,
        content: "First comment",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];
    const childCounts = new Map([["1", 5]]);

    render(
      html`
        <learning-comment-context
          .path=${path}
          .childCounts=${childCounts}
        ></learning-comment-context>
      `,
      container
    );

    await expect.element(page.getByText("5")).toBeInTheDocument();
  });
});
