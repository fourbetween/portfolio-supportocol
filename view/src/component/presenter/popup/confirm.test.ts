import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { ConfirmPopupPresenter } from "./confirm";

describe("ConfirmPopupPresenter", async () => {
  let elem: ConfirmPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "confirm-popup-presenter"
    ) as ConfirmPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルとメッセージが表示されること", async () => {
    elem.title = "削除確認";
    elem.message = "本当に削除しますか？";
    elem.open();
    await elem.updateComplete;

    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect.element(page.getByText("削除確認")).toBeVisible();
    await expect.element(page.getByText("本当に削除しますか？")).toBeVisible();
  });

  it("確認ボタンをクリックするとonConfirmが呼ばれること", async () => {
    const onConfirm = vi.fn();
    elem.title = "削除確認";
    elem.message = "本当に削除しますか？";
    elem.onConfirm = onConfirm;
    elem.open();
    await elem.updateComplete;

    const confirmButton = page.getByRole("button", { name: "確認" });
    await userEvent.click(confirmButton.element());

    expect(onConfirm).toHaveBeenCalled();
  });

  it("キャンセルボタンをクリックするとonCancelが呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.title = "削除確認";
    elem.message = "本当に削除しますか？";
    elem.onCancel = onCancel;
    elem.open();
    await elem.updateComplete;

    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton.element());

    expect(onCancel).toHaveBeenCalled();
  });

  it("カスタムボタンラベルが表示されること", async () => {
    elem.title = "確認";
    elem.message = "実行しますか？";
    elem.confirmLabel = "実行";
    elem.cancelLabel = "やめる";
    elem.open();
    await elem.updateComplete;

    await expect
      .element(page.getByRole("button", { name: "実行" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "やめる" }))
      .toBeVisible();
  });
});
