import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { CreateProjectPopupPresenter } from "./create-project";

describe("CreateProjectPopupPresenter", async () => {
  let elem: CreateProjectPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-project-popup-presenter"
    ) as CreateProjectPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("open()メソッドを呼ぶとダイアログが表示されること", async () => {
    elem.open();
    await elem.updateComplete;
    await expect.element(page.getByRole("dialog")).toBeVisible();
  });

  it("プロジェクト名入力フィールドが表示されること", async () => {
    elem.open();
    await elem.updateComplete;
    await expect
      .element(page.getByRole("textbox", { name: "プロジェクト名" }))
      .toBeVisible();
  });

  it("作成ボタンをクリックするとonCreateが呼ばれること", async () => {
    const onCreate = vi.fn();
    elem.onCreate = onCreate;
    elem.open();
    await elem.updateComplete;

    const input = page.getByRole("textbox", { name: "プロジェクト名" });
    await userEvent.fill(input.element(), "テストプロジェクト");

    const createButton = page.getByRole("button", { name: "作成" });
    await userEvent.click(createButton.element());

    expect(onCreate).toHaveBeenCalledWith("テストプロジェクト");
  });

  it("キャンセルボタンをクリックするとonCancelが呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.onCancel = onCancel;
    elem.open();
    await elem.updateComplete;

    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton.element());

    expect(onCancel).toHaveBeenCalled();
  });

  it("プロジェクト名が空の場合はonCreateが呼ばれないこと", async () => {
    const onCreate = vi.fn();
    elem.onCreate = onCreate;
    elem.open();
    await elem.updateComplete;

    const createButton = page.getByRole("button", { name: "作成" });
    await userEvent.click(createButton.element());

    expect(onCreate).not.toHaveBeenCalled();
  });
});
