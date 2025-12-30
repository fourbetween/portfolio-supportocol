import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./discussion-detail";
import type { LearningDiscussionDetail } from "./discussion-detail";

describe("learning-discussion-detail", async () => {
  let elem: LearningDiscussionDetail;

  beforeEach(() => {
    elem = document.createElement(
      "learning-discussion-detail"
    ) as LearningDiscussionDetail;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("テーマが表示されること", async () => {
    elem.discussion = { id: "1", theme: "テストテーマ" };
    await elem.updateComplete;
    expect(elem.shadowRoot!.textContent).toContain("テストテーマ");
  });

  it("編集ボタンをクリックすると onEdit が呼ばれること", async () => {
    const onEdit = vi.fn();
    elem.onEdit = onEdit;
    await elem.updateComplete;

    const editButton = elem.shadowRoot!.querySelector(
      "button"
    ) as HTMLButtonElement;
    editButton.click();
    expect(onEdit).toHaveBeenCalled();
  });

  it("isEditing が true のときに入力フォームが表示されること", async () => {
    elem.discussion = { id: "1", theme: "テストテーマ" };
    elem.isEditing = true;
    await elem.updateComplete;

    const editForm = elem.shadowRoot!.querySelector(
      "learning-discussion-edit-form"
    )!;
    await (editForm as any).updateComplete;
    const input = editForm.shadowRoot!.querySelector(
      "input"
    ) as HTMLInputElement;
    expect(input.value).toBe("テストテーマ");
  });

  it("保存ボタンをクリックすると onSave が呼ばれること", async () => {
    const onSave = vi.fn();
    elem.discussion = { id: "1", theme: "元のテーマ" };
    elem.isEditing = true;
    elem.onSave = onSave;
    await elem.updateComplete;

    const editForm = elem.shadowRoot!.querySelector(
      "learning-discussion-edit-form"
    )!;
    await (editForm as any).updateComplete;
    const input = editForm.shadowRoot!.querySelector(
      "input"
    ) as HTMLInputElement;
    input.value = "新しいテーマ";

    const saveButton = editForm.shadowRoot!.querySelector(
      ".btn-primary"
    ) as HTMLButtonElement;
    saveButton.click();

    expect(onSave).toHaveBeenCalledWith("新しいテーマ");
  });

  it("キャンセルボタンをクリックすると onCancel が呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.isEditing = true;
    elem.onCancel = onCancel;
    await elem.updateComplete;

    const editForm = elem.shadowRoot!.querySelector(
      "learning-discussion-edit-form"
    )!;
    await (editForm as any).updateComplete;
    const cancelButton = editForm.shadowRoot!.querySelectorAll(
      ".btn"
    )[1] as HTMLButtonElement;
    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("編集ボタンに正しいアイコンクラスが設定されていること", async () => {
    elem.discussion = { id: "1", theme: "テストテーマ" };
    await elem.updateComplete;

    const icon = elem.shadowRoot!.querySelector(".material-symbols-outlined");
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe("edit");
  });
});
