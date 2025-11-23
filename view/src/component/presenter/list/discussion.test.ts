import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Discussion } from "../../../model/discussion";
import type { DiscussionListPresenter } from "./discussion";

describe("DiscussionListPresenter", async () => {
  let elem: DiscussionListPresenter;

  const discussions: Discussion[] = [
    {
      id: "01J8Y000000000000000000001",
      theme: "AI開発における倫理的ガイドラインの策定について",
      background: "",
      conclusion: "",
      ruleId: "01J8Y000000000000000000000",
      visibilityLevel: "everyone",
      commentPermissionLevel: "everyone",
      createdBy: "user1",
      createdAt: "2025-01-01T00:00:00Z",
      status: "open",
    },
    {
      id: "01J8Y000000000000000000002",
      theme: "プライバシー保護に関する規定の策定",
      background: "",
      conclusion: "",
      ruleId: "01J8Y000000000000000000000",
      visibilityLevel: "authenticated",
      commentPermissionLevel: "authenticated",
      createdBy: "user2",
      createdAt: "2025-01-02T00:00:00Z",
      status: "open",
    },
    {
      id: "01J8Y000000000000000000003",
      theme: "初期ドラフトのレビュー",
      background: "",
      conclusion: "",
      ruleId: "01J8Y000000000000000000000",
      visibilityLevel: "everyone",
      commentPermissionLevel: "everyone",
      createdBy: "admin",
      createdAt: "2025-01-03T00:00:00Z",
      status: "closed",
    },
    {
      id: "01J8Y000000000000000000004",
      theme: "2022年度版ガイドライン",
      background: "",
      conclusion: "",
      ruleId: "01J8Y000000000000000000000",
      visibilityLevel: "owner",
      commentPermissionLevel: "owner",
      createdBy: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      status: "archived",
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
      .element(page.getByText("AI開発における倫理的ガイドラインの策定について"))
      .toBeInTheDocument();
    await expect
      .element(page.getByText("プライバシー保護に関する規定の策定"))
      .toBeInTheDocument();
  });

  it("ステータスごとにグループ化されて表示されること", async () => {
    const headers = elem.shadowRoot?.querySelectorAll(".status-header");
    expect(headers?.length).toBe(3);
    expect(headers?.[0].textContent).toContain("Open");
    expect(headers?.[1].textContent).toContain("Closed");
    expect(headers?.[2].textContent).toContain("Archived");
  });

  it("新規作成ボタンが表示されること", async () => {
    await expect
      .element(page.getByRole("button", { name: "新規作成" }))
      .toBeInTheDocument();
  });
});
