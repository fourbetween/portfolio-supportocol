import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-list";

describe("dialogue-comment-list", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("コメントがcreatedAtの降順で表示されること", async () => {
    const comments = [
      {
        id: "1",
        content: "Comment 1 (Oldest)",
        createdAt: "2023-01-01T00:00:00Z",
        status: "active" as const,
        commentType: "opinion",
        discussionId: "d1",
        parentCommentId: null,
      },
      {
        id: "2",
        content: "Comment 2 (Newest)",
        createdAt: "2023-01-03T00:00:00Z",
        status: "active" as const,
        commentType: "opinion",
        discussionId: "d1",
        parentCommentId: null,
      },
      {
        id: "3",
        content: "Comment 3 (Middle)",
        createdAt: "2023-01-02T00:00:00Z",
        status: "active" as const,
        commentType: "opinion",
        discussionId: "d1",
        parentCommentId: null,
      },
    ];

    render(
      html`
        <dialogue-comment-list .comments=${comments}></dialogue-comment-list>
      `,
      container
    );

    await expect.element(page.getByText("Comment 2 (Newest)")).toBeVisible();
    await expect.element(page.getByText("Comment 3 (Middle)")).toBeVisible();
    await expect.element(page.getByText("Comment 1 (Oldest)")).toBeVisible();

    // Order should be: Comment 2, Comment 3, Comment 1
    const list = document.querySelector("dialogue-comment-list");
    const cards = list?.shadowRoot?.querySelectorAll("dialogue-comment-card");
    const texts = Array.from(cards ?? []).map(
      (card) => card.shadowRoot?.textContent ?? ""
    );

    expect(texts[0]).toContain("Comment 2 (Newest)");
    expect(texts[1]).toContain("Comment 3 (Middle)");
    expect(texts[2]).toContain("Comment 1 (Oldest)");
  });
});
