import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Comment } from "../../model/comment";
import "./comment-item";

describe("learning-comment-item", { timeout: 5000 }, () => {
  let container: HTMLDivElement;

  const mockComment: Comment = {
    id: "1",
    discussionId: "d1",
    parentCommentId: null,
    commentType: "idea",
    status: "active" as const,
    content: "This is a test comment",
    createdAt: "2026-01-04T00:00:00Z",
  };

  const availableTypes = ["idea", "question", "answer"];

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("デフォルトで learning-comment-card を表示する", async () => {
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></learning-comment-item>
      `,
      container
    );
    await expect
      .element(page.getByText("This is a test comment"))
      .toBeVisible();
  });

  it("編集ボタンをクリックすると編集フォームを表示する", async () => {
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></learning-comment-item>
      `,
      container
    );
    const editButton = page.getByRole("button", { name: "edit" });
    await editButton.click();

    await expect.element(page.getByTitle("Save")).toBeVisible();
    await expect
      .element(page.getByText("This is a test comment"))
      .not.toBeInTheDocument();
  });

  it("削除ボタンをクリックすると onCommentDelete が呼ばれる", async () => {
    const onCommentDelete = vi.fn();
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          .onCommentDelete=${onCommentDelete}
        ></learning-comment-item>
      `,
      container
    );

    const deleteButton = page.getByRole("button", { name: "delete" });
    await deleteButton.click();

    expect(onCommentDelete).toHaveBeenCalledWith("1");
  });

  it("AI生成ボタンをクリックすると、コメントタイプポップアップが表示され、タイプを選択すると onCommentGenerate が呼ばれる", async () => {
    const onCommentGenerate = vi.fn();
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          .onCommentGenerate=${onCommentGenerate}
        ></learning-comment-item>
      `,
      container
    );

    const generateButton = page.getByRole("button", { name: "generate" });
    await generateButton.click();

    // ポップアップが表示されるのを待つ
    const typeButton = page.getByRole("button", { name: "question" });
    await expect.element(typeButton).toBeVisible();
    await typeButton.click();

    expect(onCommentGenerate).toHaveBeenCalledWith("1", "question");
  });

  it("返信ボタンをクリックし、タイプを選択すると返信フォームが表示され、保存すると onCommentReply が呼ばれる", async () => {
    const onCommentReply = vi.fn();
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          .onCommentReply=${onCommentReply}
        ></learning-comment-item>
      `,
      container
    );

    const replyButton = page.getByRole("button", { name: "reply" });
    await replyButton.click();

    // ポップアップが表示されるのを待つ
    const typeButton = page.getByRole("button", { name: "question" });
    await expect.element(typeButton).toBeVisible();
    await typeButton.click();

    // 返信フォームが表示される
    const textarea = page.getByRole("textbox");
    await textarea.fill("This is a reply");

    const saveButton = page.getByRole("button", { name: "Save" });
    await saveButton.click();

    expect(onCommentReply).toHaveBeenCalledWith("1", {
      commentType: "question",
      content: "This is a reply",
    });
  });

  it("アクションボタンが正しい順序（reply, generate, edit, delete）で並んでいる", async () => {
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></learning-comment-item>
      `,
      container
    );

    const buttons = page.getByRole("button");
    await expect.element(buttons.nth(0)).toHaveAttribute("aria-label", "reply");
    await expect
      .element(buttons.nth(1))
      .toHaveAttribute("aria-label", "generate");
    await expect.element(buttons.nth(2)).toHaveAttribute("aria-label", "edit");
    await expect
      .element(buttons.nth(3))
      .toHaveAttribute("aria-label", "delete");
  });
});
