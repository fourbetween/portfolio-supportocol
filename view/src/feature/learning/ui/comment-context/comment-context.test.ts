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
        type: "idea",
        status: "active" as const,
        content: "First comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        type: "question",
        status: "active" as const,
        content: "Second comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ];

    render(
      html`
        <learning-comment-context .path=${path}></learning-comment-context>
      `,
      container,
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
        type: "idea",
        status: "active" as const,
        content: "First comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        type: "question",
        status: "active" as const,
        content: "Second comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ];

    render(
      html`
        <learning-comment-context .path=${path}></learning-comment-context>
      `,
      container,
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

  it("readonly プロパティが指定された場合、末端の item に引き継がれること", async () => {
    const path = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        type: "idea",
        status: "active" as const,
        content: "First comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ];

    render(
      html`
        <learning-comment-context
          .path=${path}
          .readonly=${true}
        ></learning-comment-context>
      `,
      container,
    );

    // 末端のコメントのアクションボタン（例：edit）が表示されないことを確認
    await expect
      .element(page.getByRole("button", { name: "edit" }))
      .not.toBeInTheDocument();
  });

  it("コメントをクリックしたときに comment-select イベントが発火されること", async () => {
    const path = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        type: "idea",
        status: "active" as const,
        content: "First comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
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
          @learning-comment-select=${handleSelectComment}
        ></learning-comment-context>
      `,
      container,
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
        type: "idea",
        status: "active" as const,
        content: "First comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
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
      container,
    );

    await expect.element(page.getByText("5")).toBeInTheDocument();
  });

  it("親コメントがアーカイブされている場合、子コメントもアーカイブ状態で表示されること", async () => {
    const path = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        type: "idea",
        status: "active" as const,
        content: "Archived parent",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: "2026-01-05T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: "1",
        type: "question",
        status: "active" as const,
        content: "Child comment",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ];

    render(
      html`
        <learning-comment-context .path=${path}></learning-comment-context>
      `,
      container,
    );

    const context = container.querySelector("learning-comment-context")! as any;
    await context.updateComplete;

    // 子コメント (item) がアーカイブとして表示されているか確認
    const item = context.shadowRoot!.querySelector("learning-comment-item")!;
    const card = item.shadowRoot!.querySelector("learning-comment-card")!;
    await (card as any).updateComplete;
    const cardBody = card.shadowRoot!.querySelector(".card-body");
    expect(cardBody?.classList.contains("archived")).toBe(true);
  });
});
