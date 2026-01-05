import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import {
  AcceptProposedCommentEvent,
  RejectProposedCommentEvent,
  SelectProposedCommentEvent,
} from "../../event/comment";
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
        commentType: "idea",
        status: "proposed",
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案2",
        commentType: "question",
        status: "proposed",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
        ></learning-proposed-comment-list>
      `,
      container
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
      container
    );

    await expect
      .element(page.getByText("No proposed comments found."))
      .toBeVisible();
  });

  it("採用ボタンをクリックすると accept-proposed-comment イベントが発火されること", async () => {
    const onAccept = vi.fn();
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案1",
        commentType: "idea",
        status: "proposed",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
          @accept-proposed-comment=${(e: AcceptProposedCommentEvent) =>
            onAccept(e.comment)}
        ></learning-proposed-comment-list>
      `,
      container
    );

    await page.getByRole("button", { name: "check" }).click();

    expect(onAccept).toHaveBeenCalledWith(comments[0]);
  });

  it("却下ボタンをクリックすると reject-proposed-comment イベントが発火されること", async () => {
    const onReject = vi.fn();
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案1",
        commentType: "idea",
        status: "proposed",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
          @reject-proposed-comment=${(e: RejectProposedCommentEvent) =>
            onReject(e.comment)}
        ></learning-proposed-comment-list>
      `,
      container
    );

    await page.getByRole("button", { name: "close" }).click();

    expect(onReject).toHaveBeenCalledWith(comments[0]);
  });

  it("コメントをクリックすると select-proposed-comment イベントが発火されること", async () => {
    const onClick = vi.fn();
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案1",
        commentType: "idea",
        status: "proposed",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
          @select-proposed-comment=${(e: SelectProposedCommentEvent) =>
            onClick(e.comment)}
        ></learning-proposed-comment-list>
      `,
      container
    );

    await page.getByText("提案1").click();

    expect(onClick).toHaveBeenCalledWith(comments[0]);
  });

  it("コメントをクリックすると onClick が呼ばれること", async () => {
    const onClick = vi.fn();
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: "p1",
        content: "提案1",
        commentType: "idea",
        status: "proposed",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
          @select-proposed-comment=${(e: any) => onClick(e.comment)}
        ></learning-proposed-comment-list>
      `,
      container
    );

    await page.getByText("提案1").click();

    expect(onClick).toHaveBeenCalledWith(comments[0]);
  });

  it("ボタンがホバーコンテナ内にあり、btn-hoverクラスを持っていること", async () => {
    const comments: Comment[] = [
      {
        id: "1",
        discussionId: "d1",
        parentCommentId: null,
        content: "提案1",
        commentType: "idea",
        status: "proposed",
        createdAt: "2026-01-04T00:00:00Z",
      },
    ];

    render(
      html`
        <learning-proposed-comment-list
          .comments=${comments}
        ></learning-proposed-comment-list>
      `,
      container
    );

    const checkButton = page.getByRole("button", { name: "check" });
    const closeButton = page.getByRole("button", { name: "close" });

    await expect.element(checkButton).toHaveClass(/btn-hover/);
    await expect.element(closeButton).toHaveClass(/btn-hover/);

    // 親要素が hover-container クラスを持っていることを確認
    // page.getByRole("button", { name: "check" }).parent() のようなものがあればいいが、
    // ここでは selector で確認する
    const el = container.querySelector("learning-proposed-comment-list")!;
    const hoverContainer = el.shadowRoot!.querySelector(".hover-container");
    expect(hoverContainer).not.toBeNull();
  });
});
