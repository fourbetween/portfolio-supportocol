import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Rule } from "../../../../model/rule";
import type { ListRulePagePresenter } from "./list";

describe("ListRulePagePresenter", async () => {
  let elem: ListRulePagePresenter;

  const mockRules: Rule[] = [
    {
      id: "01234567890123456789012345",
      name: "議論ルール1",
      description: "ルールの説明1",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-01T00:00:00Z",
      commentTypes: [],
      commentTypePaths: [],
    },
    {
      id: "01234567890123456789012347",
      name: "議論ルール2",
      description: "ルールの説明2",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-02T00:00:00Z",
      commentTypes: [],
      commentTypePaths: [],
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "list-rule-page-presenter"
    ) as ListRulePagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ページタイトルが表示されること", async () => {
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("ルール一覧");
  });

  it("ルール一覧が表示されること", async () => {
    elem.rules = mockRules;
    await elem.updateComplete;
    await expect.element(page.getByText("議論ルール1")).toBeVisible();
    await expect.element(page.getByText("議論ルール2")).toBeVisible();
  });

  it("ルール一覧がリンクとして表示されること", async () => {
    elem.rules = mockRules;
    elem.getRuleLink = (id) => `/rules/${id}`;
    await elem.updateComplete;
    const link = page.getByRole("link", { name: "議論ルール1" });
    await expect.element(link).toBeVisible();
    await expect
      .element(link)
      .toHaveAttribute("href", "/rules/01234567890123456789012345");
  });

  it("新規ルール作成ボタンが表示されること", async () => {
    await expect
      .element(page.getByRole("button", { name: "新規ルール作成" }))
      .toBeVisible();
  });

  it("新規ルール作成ボタンをクリックするとonCreateRuleが呼び出されること", async () => {
    const onCreateRule = vi.fn();
    elem.onCreateRule = onCreateRule;
    await page.getByRole("button", { name: "新規ルール作成" }).click();
    expect(onCreateRule).toHaveBeenCalled();
  });

  it("ルールがない場合は空のメッセージが表示されること", async () => {
    elem.rules = [];
    await elem.updateComplete;
    await expect.element(page.getByText("ルールがありません")).toBeVisible();
  });
});
