import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Discussion } from "../../../model/discussion";
import type { DiscussionInfoPresenter } from "./discussion";

describe("DiscussionInfoPresenter", async () => {
  let elem: DiscussionInfoPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "discussion-info-presenter"
    ) as DiscussionInfoPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  const mockDiscussion: Discussion = {
    id: "discussion1",
    theme: "テスト議論のテーマ",
    background: "テスト背景の説明",
    conclusion: "テスト結論",
    ruleId: "rule1",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "user1",
    createdAt: "2024-01-01T00:00:00Z",
    status: "open",
  };

  it("背景が表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;
    await expect.element(page.getByText("テスト背景の説明")).toBeVisible();
  });

  it("結論が表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;
    await expect.element(page.getByText("テスト結論")).toBeVisible();
  });

  it("背景セクションの見出しが表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { name: "背景" }))
      .toBeVisible();
  });

  it("結論セクションの見出しが表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { name: "結論" }))
      .toBeVisible();
  });

  it("discussionがundefinedの場合は何も表示されないこと", async () => {
    elem.discussion = undefined;
    await elem.updateComplete;

    const section = elem.shadowRoot?.querySelector(".discussion-info");
    expect(section).toBeNull();
  });
});
