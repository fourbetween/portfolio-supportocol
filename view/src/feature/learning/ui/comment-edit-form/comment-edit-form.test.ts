import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-edit-form";

describe("learning-comment-edit-form", async () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("定義されていること", async () => {
    render(
      html`
        <learning-comment-edit-form></learning-comment-edit-form>
      `,
      container
    );
    const elem = container.querySelector("learning-comment-edit-form");
    expect(customElements.get("learning-comment-edit-form")).toBeDefined();
    expect(elem).toBeInstanceOf(HTMLElement);
  });

  it("初期の種類と内容がレンダリングされること", async () => {
    render(
      html`
        <learning-comment-edit-form
          .initialType=${"質問"}
          .initialContent=${"これは質問です"}
        ></learning-comment-edit-form>
      `,
      container
    );

    await expect
      .element(page.getByRole("textbox"))
      .toHaveValue("これは質問です");
    await expect.element(page.getByText("質問").first()).toBeVisible();
  });

  it("アイコンとタイトル付きの保存およびキャンセルボタンがレンダリングされること", async () => {
    render(
      html`
        <learning-comment-edit-form></learning-comment-edit-form>
      `,
      container
    );
    await expect.element(page.getByTitle("Save")).toBeVisible();
    await expect.element(page.getByTitle("Cancel")).toBeVisible();
  });

  it("parentCommentIdが設定されている場合、comment-createイベントが発火すること", async () => {
    let savedContent = "";
    let parentCommentId = "";
    const onSave = (e: any) => {
      savedContent = e.content;
      parentCommentId = e.parentCommentId;
    };

    render(
      html`
        <learning-comment-edit-form
          .parentCommentId=${"p1"}
          @comment-create=${onSave}
        ></learning-comment-edit-form>
      `,
      container
    );

    const textarea = page.getByPlaceholder("Enter your comment...");
    await textarea.fill("新しいコメント");

    const saveButton = page.getByTitle("Save");
    await saveButton.click();

    expect(savedContent).toBe("新しいコメント");
    expect(parentCommentId).toBe("p1");
  });

  it("commentIdが設定されている場合、comment-updateイベントが発火すること", async () => {
    let savedContent = "";
    let commentId = "";
    const onUpdate = (e: any) => {
      savedContent = e.content;
      commentId = e.commentId;
    };

    render(
      html`
        <learning-comment-edit-form
          .commentId=${"c1"}
          @comment-update=${onUpdate}
        ></learning-comment-edit-form>
      `,
      container
    );

    const textarea = page.getByPlaceholder("Enter your comment...");
    await textarea.fill("更新されたコメント");

    const saveButton = page.getByTitle("Save");
    await saveButton.click();

    expect(savedContent).toBe("更新されたコメント");
    expect(commentId).toBe("c1");
  });

  it("キャンセルイベントが発火すること", async () => {
    let cancelled = false;
    const onCancel = () => {
      cancelled = true;
    };

    render(
      html`
        <learning-comment-edit-form
          @comment-cancel=${onCancel}
        ></learning-comment-edit-form>
      `,
      container
    );

    const cancelButton = page.getByTitle("Cancel");
    await cancelButton.click();

    expect(cancelled).toBe(true);
  });

  it("バッジクリックでポップアップが開き、選択した種類に更新されること", async () => {
    render(
      html`
        <learning-comment-edit-form
          .availableTypes=${["質問", "回答", "アイデア"]}
          .initialType=${"質問"}
        ></learning-comment-edit-form>
      `,
      container
    );

    // Badge click
    const badge = page.getByText("質問").first();
    await badge.click();

    // Popup should be open.
    const option = page.getByRole("button", { name: "回答" });
    await option.click();

    // Badge should now show "回答"
    await expect.element(page.getByText("回答").first()).toBeVisible();
  });

  it("テキストエリアとボタンがスタイルされていること", async () => {
    render(
      html`
        <learning-comment-edit-form></learning-comment-edit-form>
      `,
      container
    );

    const textarea = page.getByPlaceholder("Enter your comment...");
    const saveButton = page.getByTitle("Save");
    const cancelButton = page.getByTitle("Cancel");

    await expect.element(textarea).toBeVisible();
    await expect.element(saveButton).toBeVisible();
    await expect.element(cancelButton).toBeVisible();
  });
});
