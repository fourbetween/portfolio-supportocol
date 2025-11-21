import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./discussion";
import type { DiscussionListPresenter, DiscussionView } from "./discussion";

describe("DiscussionListPresenter", async () => {
  let elem: DiscussionListPresenter;

  const discussions: DiscussionView[] = [
    {
      id: "01J8Y000000000000000000001",
      theme: "生成AIの著作権リスクについて",
      background: "背景",
      conclusion: "結論",
      ruleId: "01J8Y000000000000000000000",
      visibilityLevel: "everyone",
      commentPermissionLevel: "everyone",
      createdBy: "01J8Y000000000000000000000",
      createdAt: "2025-01-01T00:00:00Z",
      status: "open",
      projectName: "AI倫理ガイドライン策定",
      commentCount: 12,
      updatedAtFormatted: "2時間前",
    },
    {
      id: "01J8Y000000000000000000002",
      theme: "リモートワーク手当の増額提案",
      background: "背景",
      conclusion: "結論",
      ruleId: "01J8Y000000000000000000000",
      visibilityLevel: "everyone",
      commentPermissionLevel: "everyone",
      createdBy: "01J8Y000000000000000000000",
      createdAt: "2025-01-02T00:00:00Z",
      status: "open",
      projectName: "オフィス移転計画",
      commentCount: 8,
      updatedAtFormatted: "5時間前",
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "discussion-list-presenter"
    ) as DiscussionListPresenter;
    elem.discussions = discussions;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("議論一覧が表示されること", async () => {
    await expect
      .element(page.getByText("生成AIの著作権リスクについて"))
      .toBeInTheDocument();
    await expect
      .element(page.getByText("リモートワーク手当の増額提案"))
      .toBeInTheDocument();
  });
});
