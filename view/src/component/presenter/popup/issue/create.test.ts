import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { CreateIssuePopupPresenter } from "./create";

describe("CreateIssuePopupPresenter", async () => {
  let elem: CreateIssuePopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-issue-popup-presenter"
    ) as CreateIssuePopupPresenter;
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

  it("指摘種類選択フィールドが表示されること", async () => {
    elem.open();
    await elem.updateComplete;
    await expect
      .element(page.getByRole("combobox", { name: "指摘種類" }))
      .toBeVisible();
  });

  it("説明入力フィールドが表示されること", async () => {
    elem.open();
    await elem.updateComplete;
    await expect
      .element(page.getByRole("textbox", { name: "説明" }))
      .toBeVisible();
  });

  it("作成ボタンをクリックするとonCreateが呼ばれること", async () => {
    const onCreate = vi.fn();
    elem.onCreate = onCreate;
    elem.open();
    await elem.updateComplete;

    const typeSelect = page.getByRole("combobox", { name: "指摘種類" });
    await userEvent.selectOptions(typeSelect.element(), "contradiction");

    const descriptionInput = page.getByRole("textbox", { name: "説明" });
    await userEvent.fill(descriptionInput.element(), "テスト指摘の説明");

    const createButton = page.getByRole("button", { name: "作成" });
    await userEvent.click(createButton.element());

    expect(onCreate).toHaveBeenCalledWith({
      issueType: "contradiction",
      description: "テスト指摘の説明",
    });
  });

  it("キャンセルボタンをクリックするとclose()が呼ばれること", async () => {
    elem.open();
    await elem.updateComplete;

    const closeSpy = vi.spyOn(elem, "close");
    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton.element());

    expect(closeSpy).toHaveBeenCalled();
  });

  it("説明が空の場合はonCreateが呼ばれないこと", async () => {
    const onCreate = vi.fn();
    elem.onCreate = onCreate;
    elem.open();
    await elem.updateComplete;

    const typeSelect = page.getByRole("combobox", { name: "指摘種類" });
    await userEvent.selectOptions(typeSelect.element(), "contradiction");

    const createButton = page.getByRole("button", { name: "作成" });
    await userEvent.click(createButton.element());

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("指摘種類が未選択の場合はonCreateが呼ばれないこと", async () => {
    const onCreate = vi.fn();
    elem.onCreate = onCreate;
    elem.open();
    await elem.updateComplete;

    const descriptionInput = page.getByRole("textbox", { name: "説明" });
    await userEvent.fill(descriptionInput.element(), "テスト指摘の説明");

    const createButton = page.getByRole("button", { name: "作成" });
    await userEvent.click(createButton.element());

    expect(onCreate).not.toHaveBeenCalled();
  });
});
