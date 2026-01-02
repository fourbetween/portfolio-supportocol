import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import "./discussion-detail";

describe("learning-discussion-detail", async () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("テーマが表示されること", async () => {
    const discussion = { id: "1", theme: "テストテーマ" };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
        ></learning-discussion-detail>
      `,
      container
    );
    await expect.element(page.getByText("テストテーマ")).toBeVisible();
  });

  it("編集ボタンをクリックすると onEdit が呼ばれること", async () => {
    const onEdit = vi.fn();
    const discussion = { id: "1", theme: "テストテーマ" };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
          .onEdit=${onEdit}
        ></learning-discussion-detail>
      `,
      container
    );

    await page.getByRole("button").click();
    expect(onEdit).toHaveBeenCalled();
  });

  it("isEditing が true のときに入力フォームが表示されること", async () => {
    const discussion = { id: "1", theme: "テストテーマ" };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
          .isEditing=${true}
        ></learning-discussion-detail>
      `,
      container
    );

    const input = page.getByRole("textbox");
    await expect.element(input).toHaveValue("テストテーマ");
  });

  it("保存ボタンをクリックすると onSave が呼ばれること", async () => {
    const onSave = vi.fn();
    const discussion = { id: "1", theme: "元のテーマ" };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
          .isEditing=${true}
          .onSave=${onSave}
        ></learning-discussion-detail>
      `,
      container
    );

    const input = page.getByRole("textbox");
    await input.fill("新しいテーマ");
    await page.getByRole("button", { name: "save" }).click();

    expect(onSave).toHaveBeenCalledWith("新しいテーマ");
  });

  it("キャンセルボタンをクリックすると onCancel が呼ばれること", async () => {
    const onCancel = vi.fn();
    render(
      html`
        <learning-discussion-detail
          .isEditing=${true}
          .onCancel=${onCancel}
        ></learning-discussion-detail>
      `,
      container
    );

    await page.getByRole("button", { name: "close" }).click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("編集ボタンに正しいアイコンクラスが設定されていること", async () => {
    const discussion = { id: "1", theme: "テストテーマ" };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
        ></learning-discussion-detail>
      `,
      container
    );

    const icon = page.getByText("edit");
    await expect.element(icon).toBeVisible();
    await expect.element(icon).toHaveClass("material-symbols-outlined");
  });
});
