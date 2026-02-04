import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { LearningCommentSelectEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";
import "./proposed-comment-list";

describe("learning-proposed-comment-list", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("提案中のコメントが表示されること", async () => {
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案1",
        type: "idea",
        status: "proposed",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案2",
        type: "question",
        status: "proposed",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
        ></learning-proposed-comment-list>
      `,
      container,
    );

    await expect.element(page.getByText("提案1")).toBeVisible();
    await expect.element(page.getByText("提案2")).toBeVisible();
  });

  it("コメントがない場合にメッセージが表示されること", async () => {
    render(
      html`
        <learning-proposed-comment-list
          .comments=${[]}
        ></learning-proposed-comment-list>
      `,
      container,
    );

    await expect
      .element(page.getByText("No proposed comments found."))
      .toBeVisible();
  });

  it("コメントをクリックすると comment-select イベントが発火されること", async () => {
    const onSelect = vi.fn();
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: "parent1",
        content: "提案1",
        type: "idea",
        status: "proposed",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
          @learning-comment-select=${(e: LearningCommentSelectEvent) =>
            onSelect(e.commentId)}
        ></learning-proposed-comment-list>
      `,
      container,
    );

    await page.getByText("提案1").click();

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("採用ボタンと却下ボタンが表示されないこと", async () => {
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案1",
        type: "idea",
        status: "proposed",
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
        ></learning-proposed-comment-list>
      `,
      container,
    );

    await expect
      .element(page.getByRole("button", { name: "check" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "close" }))
      .not.toBeInTheDocument();
  });
});
