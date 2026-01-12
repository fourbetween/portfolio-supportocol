import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { DialogueCommentCreateEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";
import "./comment-item";

describe("dialogue-comment-item", { timeout: 5000 }, () => {
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

  it("デフォルトで dialogue-comment-card を表示する", async () => {
    render(
      html`
        <dialogue-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></dialogue-comment-item>
      `,
      container
    );
    await expect
      .element(page.getByText("This is a test comment"))
      .toBeVisible();
  });

  it("replyボタンをクリックするとreplyフォームが表示される", async () => {
    render(
      html`
        <dialogue-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></dialogue-comment-item>
      `,
      container
    );

    const replyButton = page.getByRole("button", { name: "reply" });
    await replyButton.click();

    await expect.element(page.getByRole("textbox")).toBeVisible();
    await expect.element(page.getByRole("combobox")).toBeVisible();
  });

  it("replyフォームで送信するとdialogue-comment-createイベントが発火される", async () => {
    let createdEvent: {
      parentCommentId: string | null;
      commentType: string;
      content: string;
    } | null = null;

    const handleCreate = (e: any) => {
      createdEvent = {
        parentCommentId: e.parentCommentId,
        commentType: e.commentType,
        content: e.content,
      };
    };

    render(
      html`
        <dialogue-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          @dialogue-comment-create=${handleCreate}
        ></dialogue-comment-item>
      `,
      container
    );

    const replyButton = page.getByRole("button", { name: "reply" });
    await replyButton.click();

    const textarea = page.getByRole("textbox");
    await textarea.fill("This is my reply");

    const saveButton = page.getByTitle("Save");
    await saveButton.click();

    expect(createdEvent).toEqual({
      parentCommentId: "1",
      commentType: "idea",
      content: "This is my reply",
    });
  });

  it("コメントをクリックするとdialogue-comment-selectイベントが発火される", async () => {
    let selectedCommentId = "";

    const handleSelect = (e: any) => {
      selectedCommentId = e.commentId;
    };

    render(
      html`
        <dialogue-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          @dialogue-comment-select=${handleSelect}
        ></dialogue-comment-item>
      `,
      container
    );

    await page.getByText("This is a test comment").click();

    expect(selectedCommentId).toBe("1");
  });

  it("replyフォームでキャンセルするとフォームが閉じる", async () => {
    render(
      html`
        <dialogue-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></dialogue-comment-item>
      `,
      container
    );

    const replyButton = page.getByRole("button", { name: "reply" });
    await replyButton.click();

    await expect.element(page.getByRole("textbox")).toBeVisible();

    const cancelButton = page.getByTitle("Cancel");
    await cancelButton.click();

    await expect.element(page.getByRole("textbox")).not.toBeInTheDocument();
  });

  it("セレクトボックスでタイプを変更できる", async () => {
    let commentType = "";

    const handleCreate = (e: DialogueCommentCreateEvent) => {
      commentType = e.commentType;
    };

    render(
      html`
        <dialogue-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          @dialogue-comment-create=${handleCreate}
        ></dialogue-comment-item>
      `,
      container
    );

    const replyButton = page.getByRole("button", { name: "reply" });
    await replyButton.click();

    const select = page.getByRole("combobox");
    await select.selectOptions("question");

    const textarea = page.getByRole("textbox");
    await textarea.fill("Why is this?");

    const saveButton = page.getByTitle("Save");
    await saveButton.click();

    expect(commentType).toBe("question");
  });
});
