import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { LearningDiscussionUpdateEvent } from "../../event/discussion";
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
    const discussion = {
      id: "1",
      theme: "テストテーマ",
      conclusion: "テスト結論",
      status: "public" as const,
    };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
        ></learning-discussion-detail>
      `,
      container
    );
    await expect.element(page.getByText("テストテーマ")).toBeVisible();
    await expect.element(page.getByText("テスト結論")).toBeVisible();
  });

  it("セクションタイトル 'Theme' と 'Conclusion' が表示されること", async () => {
    const discussion = {
      id: "1",
      theme: "テストテーマ",
      conclusion: "テスト結論",
      status: "public" as const,
    };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
        ></learning-discussion-detail>
      `,
      container
    );
    await expect.element(page.getByText("Theme")).toBeVisible();
    await expect.element(page.getByText("Conclusion")).toBeVisible();
  });

  it("編集ボタンをクリックすると discussion-form-open イベントが発火されること", async () => {
    const onEdit = vi.fn();
    const discussion = {
      id: "1",
      theme: "テストテーマ",
      conclusion: "テスト結論",
      status: "public" as const,
    };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
          @learning-discussion-form-open=${() => onEdit()}
        ></learning-discussion-detail>
      `,
      container
    );

    await page.getByRole("button", { name: "edit" }).click();
    expect(onEdit).toHaveBeenCalled();
  });

  it("isEditing が true のときに入力フォームが表示されること", async () => {
    const discussion = {
      id: "1",
      theme: "テストテーマ",
      conclusion: "テスト結論",
      status: "public" as const,
    };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
          .isEditing=${true}
        ></learning-discussion-detail>
      `,
      container
    );

    const textboxes = page.getByRole("textbox");
    await expect.element(textboxes.first()).toHaveValue("テストテーマ");
    await expect.element(textboxes.last()).toHaveValue("テスト結論");
  });

  it("保存ボタンをクリックすると discussion-update イベントが発火されること", async () => {
    const onSave = vi.fn();
    const discussion = {
      id: "1",
      theme: "元のテーマ",
      conclusion: "元の結論",
      status: "public" as const,
    };
    render(
      html`
        <learning-discussion-detail
          .discussion=${discussion}
          .isEditing=${true}
          @learning-discussion-update=${(e: LearningDiscussionUpdateEvent) =>
            onSave(e.theme, e.conclusion)}
        ></learning-discussion-detail>
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
        <learning-discussion-detail
          .isEditing=${true}
          @learning-discussion-form-close=${() => onCancel()}
        ></learning-discussion-detail>
      `,
      container
    );

    await page.getByRole("button", { name: "close" }).click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("編集ボタンに正しいアイコンクラスが設定されていること", async () => {
    const discussion = {
      id: "1",
      theme: "テストテーマ",
      conclusion: "テスト結論",
      status: "public" as const,
    };
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
