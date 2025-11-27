import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Discussion } from "../../../../model/discussion";
import type { ListDiscussionPagePresenter } from "./list";

describe("ListDiscussionPagePresenter", async () => {
  let elem: ListDiscussionPagePresenter;

  const mockDiscussions: Discussion[] = [
    {
      id: "01234567890123456789012348",
      theme: "議論のテーマ1",
      background: "背景",
      conclusion: "結論",
      ruleId: "01234567890123456789012349",
      visibilityLevel: "everyone",
      commentPermissionLevel: "everyone",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-01T00:00:00Z",
      status: "open",
    },
    {
      id: "01234567890123456789012350",
      theme: "議論のテーマ2",
      background: "背景2",
      conclusion: "結論2",
      ruleId: "01234567890123456789012349",
      visibilityLevel: "authenticated",
      commentPermissionLevel: "authenticated",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-02T00:00:00Z",
      status: "open",
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "list-discussion-page-presenter"
    ) as ListDiscussionPagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ページタイトルが表示されること", async () => {
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("議論一覧");
  });

  it("議論一覧が表示されること", async () => {
    elem.discussions = mockDiscussions;
    await elem.updateComplete;
    await expect.element(page.getByText("議論のテーマ1")).toBeVisible();
    await expect.element(page.getByText("議論のテーマ2")).toBeVisible();
  });

  it("議論一覧がリンクとして表示されること", async () => {
    elem.discussions = mockDiscussions;
    elem.getDiscussionLink = (id) => `/discussions/${id}`;
    await elem.updateComplete;
    const link = page.getByRole("link", { name: "議論のテーマ1" });
    await expect.element(link).toBeVisible();
    await expect
      .element(link)
      .toHaveAttribute("href", "/discussions/01234567890123456789012348");
  });

  it("議論がない場合は空のメッセージが表示されること", async () => {
    elem.discussions = [];
    await elem.updateComplete;
    await expect.element(page.getByText("議論がありません")).toBeVisible();
  });

  it("検索入力欄が表示されること", async () => {
    await expect.element(page.getByPlaceholder("議論を検索...")).toBeVisible();
  });

  it("検索入力時にonSearchが呼ばれること", async () => {
    const onSearch = vi.fn();
    elem.onSearch = onSearch;
    const input = page.getByPlaceholder("議論を検索...");
    await input.fill("テスト");
    expect(onSearch).toHaveBeenCalledWith("テスト");
  });
});
