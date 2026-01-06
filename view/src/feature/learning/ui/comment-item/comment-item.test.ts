import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

  it("削除ボタンをクリックすると comment-delete イベントが発火される", async () => {
    let deletedCommentId = "";
    const handleDelete = (e: any) => {
      deletedCommentId = e.commentId;
    };
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          @comment-delete=${handleDelete}
        ></learning-comment-item>
      `,
      container
    );

    const deleteButton = page.getByRole("button", { name: "delete" });
    await deleteButton.click();

    expect(deletedCommentId).toBe("1");
  });

  it("AI生成ボタンをクリックすると、コメントタイプポップアップが表示され、タイプを選択すると comment-generate イベントが発火される", async () => {
    let generatedParentId = "";
    let generatedType = "";
    const handleGenerate = (e: any) => {
      generatedParentId = e.parentCommentId;
      generatedType = e.commentType;
    };
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          @comment-generate=${handleGenerate}
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

    expect(generatedParentId).toBe("1");
    expect(generatedType).toBe("question");
  });

  it("返信ボタンをクリックし、タイプを選択すると返信フォームが表示され、保存すると comment-create イベントが発火される", async () => {
    let replyParentId = "";
    let replyType = "";
    let replyContent = "";
    const handleCreate = (e: any) => {
      replyParentId = e.parentCommentId;
      replyType = e.commentType;
      replyContent = e.content;
    };
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          @comment-create=${handleCreate}
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

    expect(replyParentId).toBe("1");
    expect(replyType).toBe("question");
    expect(replyContent).toBe("This is a reply");
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
