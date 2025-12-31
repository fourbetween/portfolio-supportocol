import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "./discussion-edit-form";
import type { LearningDiscussionEditForm } from "./discussion-edit-form";

describe("learning-discussion-edit-form", () => {
  let elem: LearningDiscussionEditForm;

  beforeEach(() => {
    elem = document.createElement(
      "learning-discussion-edit-form"
    ) as LearningDiscussionEditForm;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("初期値としてテーマが表示されること", async () => {
    elem.theme = "テストテーマ";
    await elem.updateComplete;

    const input = page.getByRole("textbox");
    await expect.element(input).toHaveValue("テストテーマ");
  });

  it("保存ボタンに save アイコンが表示されていること", async () => {
    const saveButton = elem.shadowRoot!.querySelector(".btn-primary")!;
    const icon = saveButton.querySelector(".material-symbols-outlined");
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe("save");
  });

  it("キャンセルボタンに close アイコンが表示されていること", async () => {
    const cancelButton = elem.shadowRoot!.querySelectorAll(".btn")[1]!;
    const icon = cancelButton.querySelector(".material-symbols-outlined");
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe("close");
  });

  it("保存ボタンをクリックすると onSave が入力値とともに呼ばれること", async () => {
    const onSave = vi.fn();
    elem.theme = "元のテーマ";
    elem.onSave = onSave;
    await elem.updateComplete;

    const input = elem.shadowRoot!.querySelector("input") as HTMLInputElement;
    input.value = "新しいテーマ";

    const saveButton = elem.shadowRoot!.querySelector(
      ".btn-primary"
    ) as HTMLButtonElement;
    saveButton.click();

    expect(onSave).toHaveBeenCalledWith("新しいテーマ");
  });

  it("キャンセルボタンをクリックすると onCancel が呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.onCancel = onCancel;
    await elem.updateComplete;

    const cancelButton = elem.shadowRoot!.querySelectorAll(
      ".btn"
    )[1] as HTMLButtonElement;
    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });
});
