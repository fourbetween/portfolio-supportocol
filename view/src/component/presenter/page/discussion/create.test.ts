import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Rule } from "../../../../model/rule";
import type { CreateDiscussionPagePresenter } from "./create";

describe("CreateDiscussionPagePresenter", async () => {
  let elem: CreateDiscussionPagePresenter;

  const mockRules: Rule[] = [
    {
      id: "01234567890123456789012349",
      name: "標準ルール",
      description: "標準的な議論のルール",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-01T00:00:00Z",
      commentTypes: [],
      commentTypePaths: [],
    },
    {
      id: "01234567890123456789012350",
      name: "厳密ルール",
      description: "厳密な論証を行うルール",
      createdBy: "01234567890123456789012346",
      createdAt: "2024-01-02T00:00:00Z",
      commentTypes: [],
      commentTypePaths: [],
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "create-discussion-page-presenter"
    ) as CreateDiscussionPagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ページタイトルが表示されること", async () => {
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("新規議論作成");
  });

  it("テーマ入力欄が表示されること", async () => {
    await expect.element(page.getByLabelText("テーマ")).toBeVisible();
  });

  it("背景入力欄が表示されること", async () => {
    await expect.element(page.getByLabelText("背景")).toBeVisible();
  });

  it("結論入力欄が表示されること", async () => {
    await expect.element(page.getByLabelText("結論（初期案）")).toBeVisible();
  });

  it("ルール選択欄が表示されること", async () => {
    elem.rules = mockRules;
    await elem.updateComplete;
    await expect.element(page.getByLabelText("ルール")).toBeVisible();
  });

  it("公開レベル選択欄が表示されること", async () => {
    await expect.element(page.getByLabelText("公開レベル")).toBeVisible();
  });

  it("コメント許可レベル選択欄が表示されること", async () => {
    await expect
      .element(page.getByLabelText("コメント許可レベル"))
      .toBeVisible();
  });

  it("作成ボタンが表示されること", async () => {
    await expect
      .element(page.getByRole("button", { name: "作成" }))
      .toBeVisible();
  });

  it("ルール一覧が選択肢として表示されること", async () => {
    elem.rules = mockRules;
    await elem.updateComplete;
    const select = elem.shadowRoot?.querySelector(
      "#ruleId"
    ) as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(3); // 「選択してください」 + 2つのルール
    expect(select.options[1].textContent).toBe("標準ルール");
    expect(select.options[2].textContent).toBe("厳密ルール");
  });

  it("フォーム送信時にonSubmitが呼ばれること", async () => {
    const onSubmit = vi.fn();
    elem.rules = mockRules;
    elem.onSubmit = onSubmit;
    await elem.updateComplete;

    await page.getByLabelText("テーマ").fill("テストテーマ");
    await page.getByLabelText("背景").fill("テスト背景");
    await page.getByLabelText("結論（初期案）").fill("テスト結論");
    await page.getByLabelText("ルール").selectOptions([mockRules[0].id]);
    await page.getByLabelText("公開レベル").selectOptions(["everyone"]);
    await page
      .getByLabelText("コメント許可レベル")
      .selectOptions(["authenticated"]);
    await page.getByRole("button", { name: "作成" }).click();

    expect(onSubmit).toHaveBeenCalledWith({
      theme: "テストテーマ",
      background: "テスト背景",
      conclusion: "テスト結論",
      ruleId: mockRules[0].id,
      visibilityLevel: "everyone",
      commentPermissionLevel: "authenticated",
    });
  });

  it("キャンセルボタンが表示されること", async () => {
    await expect
      .element(page.getByRole("button", { name: "キャンセル" }))
      .toBeVisible();
  });

  it("キャンセルボタンクリック時にonCancelが呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.onCancel = onCancel;

    await page.getByRole("button", { name: "キャンセル" }).click();

    expect(onCancel).toHaveBeenCalled();
  });
});
