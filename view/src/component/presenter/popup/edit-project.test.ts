import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { EditProjectPopupPresenter } from "./edit-project";

describe("EditProjectPopupPresenter", async () => {
  let elem: EditProjectPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "edit-project-popup-presenter"
    ) as EditProjectPopupPresenter;
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

  it("プロジェクト名が入力フィールドに表示されること", async () => {
    elem.projectName = "テストプロジェクト";
    elem.open();
    await elem.updateComplete;

    const input = page.getByRole("textbox", { name: "プロジェクト名" });
    await expect.element(input).toHaveValue("テストプロジェクト");
  });

  it("保存ボタンをクリックするとonSaveが呼ばれること", async () => {
    const onSave = vi.fn();
    elem.projectName = "テストプロジェクト";
    elem.onSave = onSave;
    elem.open();
    await elem.updateComplete;

    const input = page.getByRole("textbox", { name: "プロジェクト名" });
    await userEvent.clear(input.element());
    await userEvent.fill(input.element(), "更新されたプロジェクト");

    const saveButton = page.getByRole("button", { name: "保存" });
    await userEvent.click(saveButton.element());

    expect(onSave).toHaveBeenCalledWith("更新されたプロジェクト");
  });

  it("キャンセルボタンをクリックするとonCancelが呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.projectName = "テストプロジェクト";
    elem.onCancel = onCancel;
    elem.open();
    await elem.updateComplete;

    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton.element());

    expect(onCancel).toHaveBeenCalled();
  });

  it("プロジェクト名が空の場合はonSaveが呼ばれないこと", async () => {
    const onSave = vi.fn();
    elem.projectName = "";
    elem.onSave = onSave;
    elem.open();
    await elem.updateComplete;

    const saveButton = page.getByRole("button", { name: "保存" });
    await userEvent.click(saveButton.element());

    expect(onSave).not.toHaveBeenCalled();
  });
});
