import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { ChangeStatusPopupPresenter } from "./change_status";

describe("ChangeStatusPopupPresenter", async () => {
  let elem: ChangeStatusPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "change-status-popup-presenter"
    ) as ChangeStatusPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("open()メソッドを呼ぶとダイアログが表示されること", async () => {
    elem.currentStatus = "assigned";
    elem.open();
    await elem.updateComplete;
    await expect.element(page.getByRole("dialog")).toBeVisible();
  });

  it("ステータス選択フィールドが表示されること", async () => {
    elem.currentStatus = "assigned";
    elem.open();
    await elem.updateComplete;
    await expect
      .element(page.getByRole("combobox", { name: "ステータス" }))
      .toBeVisible();
  });

  it("現在のステータスが初期選択されていること", async () => {
    elem.currentStatus = "assigned";
    elem.open();
    await elem.updateComplete;

    const select = elem.shadowRoot?.querySelector(
      "#comment-status"
    ) as HTMLSelectElement;
    expect(select?.value).toBe("assigned");
  });

  it("変更ボタンをクリックするとonChangeStatusが呼ばれること", async () => {
    const onChangeStatus = vi.fn();
    elem.currentStatus = "assigned";
    elem.onChangeStatus = onChangeStatus;
    elem.open();
    await elem.updateComplete;

    const statusSelect = page.getByRole("combobox", { name: "ステータス" });
    await userEvent.selectOptions(statusSelect.element(), "archived");

    const changeButton = page.getByRole("button", { name: "変更" });
    await userEvent.click(changeButton.element());

    expect(onChangeStatus).toHaveBeenCalledWith("archived");
  });

  it("キャンセルボタンをクリックするとclose()が呼ばれること", async () => {
    elem.currentStatus = "assigned";
    elem.open();
    await elem.updateComplete;

    const closeSpy = vi.spyOn(elem, "close");
    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton.element());

    expect(closeSpy).toHaveBeenCalled();
  });

  it("すべてのステータスオプションが存在すること", async () => {
    elem.currentStatus = "assigned";
    elem.open();
    await elem.updateComplete;

    const select = elem.shadowRoot?.querySelector(
      "#comment-status"
    ) as HTMLSelectElement;
    const options = Array.from(select?.options ?? []);
    const optionValues = options.map((opt) => opt.value);

    expect(optionValues).toContain("unassigned");
    expect(optionValues).toContain("assigned");
    expect(optionValues).toContain("archived");
    expect(optionValues).toContain("deleted");
  });
});
