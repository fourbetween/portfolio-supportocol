import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { RequestUpdateDiscussionEvent } from "../../event/discussion";
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

  it("初期値としてテーマが表示されること", async () => {
    const theme = "テストテーマ";
    render(
      html`
        <learning-discussion-edit-form
          .theme=${theme}
        ></learning-discussion-edit-form>
      `,
      container
    );

    const input = page.getByRole("textbox");
    await expect.element(input).toHaveValue("テストテーマ");
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
    render(
      html`
        <learning-discussion-edit-form
          .theme=${theme}
          @discussion-update=${(e: RequestUpdateDiscussionEvent) =>
            onSave(e.theme)}
        ></learning-discussion-edit-form>
      `,
      container
    );

    const input = page.getByRole("textbox");
    await input.fill("新しいテーマ");

    await page.getByRole("button", { name: "save" }).click();

    expect(onSave).toHaveBeenCalledWith("新しいテーマ");
  });

  it("キャンセルボタンをクリックすると cancel-edit-discussion イベントが発火されること", async () => {
    const onCancel = vi.fn();
    render(
      html`
        <learning-discussion-edit-form
          @cancel-edit-discussion=${() => onCancel()}
        ></learning-discussion-edit-form>
      `,
      container
    );

    await page.getByRole("button", { name: "close" }).click();

    expect(onCancel).toHaveBeenCalled();
  });
});
