import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { CreateRulePagePresenter } from "./create";

describe("CreateRulePagePresenter", async () => {
  let elem: CreateRulePagePresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-rule-page-presenter"
    ) as CreateRulePagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ページタイトルが表示されること", async () => {
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("ルール作成");
  });

  it("ルール名の入力欄が表示されること", async () => {
    const input = page.getByLabelText("ルール名");
    await expect.element(input).toBeVisible();
    await expect.element(input).toHaveValue("");
  });

  it("ルール説明の入力欄が表示されること", async () => {
    const textarea = page.getByRole("textbox", { name: "説明" });
    await expect.element(textarea).toBeVisible();
    await expect.element(textarea).toHaveValue("");
  });

  it("作成ボタンが表示されること", async () => {
    const createButton = page.getByRole("button", { name: "作成" });
    await expect.element(createButton).toBeVisible();
  });

  it("キャンセルボタンが表示されること", async () => {
    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await expect.element(cancelButton).toBeVisible();
  });

  it("作成ボタンをクリックするとonSaveが呼ばれること", async () => {
    const onSave = vi.fn();
    elem.onSave = onSave;

    const createButton = page.getByRole("button", { name: "作成" });
    await createButton.click();

    expect(onSave).toHaveBeenCalled();
  });

  it("キャンセルボタンをクリックするとonCancelが呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.onCancel = onCancel;

    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("ルール名を入力して作成すると入力した名前が渡されること", async () => {
    const onSave = vi.fn();
    elem.onSave = onSave;
    await elem.updateComplete;

    const nameInput = page.getByLabelText("ルール名");
    await userEvent.fill(nameInput.element(), "新しいルール");
    await elem.updateComplete;

    const createButton = page.getByRole("button", { name: "作成" });
    await createButton.click();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: "新しいルール" })
    );
  });

  it("コメント種類を追加ボタンが表示されること", async () => {
    const addButton = page.getByRole("button", {
      name: "+ コメント種類を追加",
    });
    await expect.element(addButton).toBeVisible();
  });

  it("コメント種類を追加すると一覧に反映されること", async () => {
    await elem.updateComplete;

    // 追加ボタンをクリック
    const addButton = page.getByRole("button", {
      name: "+ コメント種類を追加",
    });
    await addButton.click();
    await elem.updateComplete;

    // ポップアップが開いていることを確認
    await expect.element(page.getByRole("dialog")).toBeVisible();

    // フォームに入力
    const nameInput = page.getByRole("textbox", { name: "名前" });
    await userEvent.fill(nameInput.element(), "主張");

    // 追加ボタンをクリック
    const submitButton = page.getByRole("button", {
      name: "追加",
      exact: true,
    });
    await submitButton.click();
    await elem.updateComplete;

    // 一覧に反映されていることを確認
    const list = page.getByRole("list");
    await expect.element(list.getByText("主張")).toBeVisible();
  });
});
