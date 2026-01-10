import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-card";

describe("learning-comment-card", async () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("本文が表示されること", async () => {
    const comment = {
      id: "1",
      discussionId: "1",
      parentCommentId: "0",
      content: "content",
      commentType: "idea",
      status: "active" as const,
      createdAt: "2026-01-04T00:00:00Z",
    };
    render(
      html`
        <learning-comment-card .comment=${comment}></learning-comment-card>
      `,
      container
    );
    await expect.element(page.getByText("content")).toBeInTheDocument();
  });

  it("子コメント数が表示されること", async () => {
    const comment = {
      id: "1",
      discussionId: "1",
      parentCommentId: "0",
      content: "content",
      commentType: "idea",
      status: "active" as const,
      createdAt: "2026-01-04T00:00:00Z",
    };
    render(
      html`
        <learning-comment-card
          .comment=${comment}
          .activeChildrenCount=${5}
        ></learning-comment-card>
      `,
      container
    );
    await expect.element(page.getByText("5")).toBeInTheDocument();
  });

  it("子コメント数が0の場合は表示されないこと", async () => {
    const comment = {
      id: "1",
      discussionId: "1",
      parentCommentId: "0",
      content: "content",
      commentType: "idea",
      status: "active" as const,
      createdAt: "2026-01-04T00:00:00Z",
    };
    render(
      html`
        <learning-comment-card
          .comment=${comment}
          .activeChildrenCount=${0}
        ></learning-comment-card>
      `,
      container
    );
    // 5などの数字が表示されていないことを確認（より正確には .child-count が存在しないこと）
    const childCount = container
      .querySelector("learning-comment-card")
      ?.shadowRoot?.querySelector(".child-count");
    expect(childCount).toBeNull();
  });

  it("作成日時が表示されること", async () => {
    const comment = {
      id: "1",
      discussionId: "1",
      parentCommentId: "0",
      content: "content",
      commentType: "idea",
      status: "active" as const,
      createdAt: "2026-01-04T12:34:56Z",
    };
    render(
      html`
        <learning-comment-card .comment=${comment}></learning-comment-card>
      `,
      container
    );
    await expect.element(page.getByText("1/4/2026, 12:34:56 PM")).toBeVisible();
  });
  it("statusがproposedの場合、proposedクラスが付与されること", async () => {
    const comment = {
      id: "1",
      discussionId: "1",
      parentCommentId: "0",
      content: "content",
      commentType: "idea",
      status: "proposed" as const,
      createdAt: "2026-01-04T12:34:56Z",
    };
    render(
      html`
        <learning-comment-card .comment=${comment}></learning-comment-card>
      `,
      container
    );
    const el = container.querySelector("learning-comment-card") as any;
    await el.updateComplete;
    const cardBody = el.shadowRoot?.querySelector(".card-body");
    expect(cardBody?.classList.contains("proposed")).toBe(true);
  });
});
