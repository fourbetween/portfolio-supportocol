import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type {
  DiscussionCardPresenter,
  DiscussionCardProps,
} from "./discussion";

describe("DiscussionCardPresenter", async () => {
  let elem: DiscussionCardPresenter;
  const discussionCard: DiscussionCardProps = {
    id: "01234567890123456789012345",
    theme: "How to improve the filtering logic?",
    authorName: "octocat",
    commentCount: 12,
  };

  beforeEach(() => {
    elem = document.createElement(
      "discussion-card-presenter"
    ) as DiscussionCardPresenter;
    elem.discussionCard = discussionCard;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("テーマが表示されること", async () => {
    await expect
      .element(page.getByText("How to improve the filtering logic?"))
      .toBeInTheDocument();
  });

  it("作成者名が表示されること", async () => {
    await expect.element(page.getByText("octocat")).toBeInTheDocument();
  });

  it("コメント数が表示されること", async () => {
    await expect.element(page.getByText("12")).toBeInTheDocument();
  });

  it("コメントアイコンが表示されること", async () => {
    const icon = elem.shadowRoot?.querySelector(
      ".comment-info .material-symbols-outlined"
    );
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toBe("chat_bubble");
  });
});
