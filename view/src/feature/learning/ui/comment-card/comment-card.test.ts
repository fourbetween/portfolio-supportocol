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
    };
    render(
      html`
        <learning-comment-card .comment=${comment}></learning-comment-card>
      `,
      container
    );
    await expect.element(page.getByText("content")).toBeInTheDocument();
  });
});
