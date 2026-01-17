import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { LearningDiscussionUpdateEvent } from "../../event/discussion";
import "./discussion-edit-form";

describe("learning-discussion-edit-form", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("初期値としてテーマと結論が表示されること", async () => {
    const theme = "テストテーマ";
    const conclusion = "テスト結論";
    render(
      html`
        <learning-discussion-edit-form
          .theme=${theme}
          .conclusion=${conclusion}
        ></learning-discussion-edit-form>
      `,
      container
    );

    const textboxes = page.getByRole("textbox");
    await expect.element(textboxes.first()).toHaveValue("テストテーマ");
    await expect.element(textboxes.last()).toHaveValue("テスト結論");
  });

  it("保存ボタンに save アイコンが表示されていること", async () => {
    render(
      html`
        <learning-discussion-edit-form></learning-discussion-edit-form>
      `,
      container
    );

    const saveButton = page.getByRole("button", { name: "save" });
    await expect.element(saveButton).toBeVisible();

    const element = saveButton.element();
    const icon = element.querySelector(".material-symbols-outlined");
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe("save");
  });

  it("キャンセルボタンに close アイコンが表示されていること", async () => {
    render(
      html`
        <learning-discussion-edit-form></learning-discussion-edit-form>
      `,
      container
    );

    const cancelButton = page.getByRole("button", { name: "close" });
    await expect.element(cancelButton).toBeVisible();

    const element = cancelButton.element();
    const icon = element.querySelector(".material-symbols-outlined");
    expect(icon).not.toBeNull();
    expect(icon?.textContent).toBe("close");
  });

  it("保存ボタンをクリックすると discussion-update イベントが入力値とともに発火されること", async () => {
    const onSave = vi.fn();
    const theme = "元のテーマ";
    const conclusion = "元の結論";
    render(
      html`
        <learning-discussion-edit-form
          .theme=${theme}
          .conclusion=${conclusion}
          @learning-discussion-update=${(e: LearningDiscussionUpdateEvent) =>
            onSave(e.theme, e.conclusion)}
        ></learning-discussion-edit-form>
      `,
      container
    );

    const textboxes = page.getByRole("textbox");
    await textboxes.first().fill("新しいテーマ");
    await textboxes.last().fill("新しい結論");

    await page.getByRole("button", { name: "save" }).click();

    expect(onSave).toHaveBeenCalledWith("新しいテーマ", "新しい結論");
  });

  it("キャンセルボタンをクリックすると discussion-form-close イベントが発火されること", async () => {
    const onCancel = vi.fn();
    render(
      html`
        <learning-discussion-edit-form
          @learning-discussion-form-close=${() => onCancel()}
        ></learning-discussion-edit-form>
      `,
      container
    );

    await page.getByRole("button", { name: "close" }).click();

    expect(onCancel).toHaveBeenCalled();
  });
});
