import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Comment } from "../../model/comment";
import "./comment-item";
import type { LearningCommentItem } from "./comment-item";

describe("learning-comment-item", { timeout: 5000 }, () => {
  let element: LearningCommentItem;

  const mockComment: Comment = {
    id: "1",
    discussionId: "d1",
    parentCommentId: null,
    commentType: "idea", status: "active" as const,
    content: "This is a test comment",
  };

  const availableTypes = ["idea", "question", "answer"];

  beforeEach(() => {
    element = document.createElement(
      "learning-comment-item"
    ) as LearningCommentItem;
    element.comment = mockComment;
    element.availableTypes = availableTypes;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it("デフォルトで learning-comment-card を表示する", async () => {
    await expect
      .element(page.getByText("This is a test comment"))
      .toBeVisible();
  });

  it("編集ボタンをクリックすると編集フォームを表示する", async () => {
    const editButton = page.getByRole("button", { name: "edit" });
    await editButton.click();

    await expect.element(page.getByTitle("Save")).toBeVisible();
    await expect
      .element(page.getByText("This is a test comment"))
      .not.toBeInTheDocument();
  });

  it("削除ボタンをクリックすると onCommentDelete が呼ばれる", async () => {
    let deletedId = "";
    element.onCommentDelete = (id: string) => {
      deletedId = id;
    };

    const deleteButton = page.getByRole("button", { name: "delete" });
    await deleteButton.click();

    expect(deletedId).toBe("1");
  });

  it("AI生成ボタンをクリックすると onCommentGenerate が呼ばれる", async () => {
    let generatedId = "";
    (element as any).onCommentGenerate = (id: string) => {
      generatedId = id;
    };

    const generateButton = page.getByRole("button", { name: "generate" });
    await expect.element(generateButton).toBeVisible();
    await generateButton.click();

    expect(generatedId).toBe("1");
  });
});
