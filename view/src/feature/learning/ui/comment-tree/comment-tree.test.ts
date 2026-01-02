import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-tree";
import type { LearningCommentTree } from "./comment-tree";

describe("learning-comment-tree", async () => {
  let elem: LearningCommentTree;

  beforeEach(() => {
    elem = document.createElement(
      "learning-comment-tree"
    ) as LearningCommentTree;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("単一のコメントが表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;
    await expect.element(page.getByText("root comment")).toBeInTheDocument();
  });

  it("子コメントが種類ごとにグループ化されて表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "child idea 1",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "child question 1",
        commentType: "question",
        status: "active" as const,
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "1",
        content: "child idea 2",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    await expect.element(page.getByText("root comment")).toBeInTheDocument();
    await expect.element(page.getByText("child idea 1")).toBeInTheDocument();
    await expect.element(page.getByText("child idea 2")).toBeInTheDocument();
    await expect
      .element(page.getByText("child question 1"))
      .toBeInTheDocument();

    // Check for grouping labels (assuming we use the type name as label)
    // Now root comment also has a type badge, so there might be multiple "idea" badges
    await expect
      .element(page.getByText("idea", { exact: true }).first())
      .toBeInTheDocument();
    await expect
      .element(page.getByText("question", { exact: true }))
      .toBeInTheDocument();
  }, 10000);

  it("コメントをホバーすると編集アイコンが表示され、クリックすると編集フォームが表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    const card = page.getByText("root comment");
    await card.hover();

    const editButton = page.getByRole("button", { name: "edit" });
    await expect.element(editButton).toBeInTheDocument();

    await editButton.click();
    await elem.updateComplete;

    // 編集フォームが表示されていることを確認
    await expect.element(page.getByRole("textbox")).toBeInTheDocument();
    await expect
      .element(page.getByText("root comment"))
      .not.toBeInTheDocument();

    // キャンセルをクリック
    const cancelButton = page.getByTitle("Cancel");
    await cancelButton.click();
    await elem.updateComplete;

    // 元のカードに戻っていることを確認
    await expect.element(page.getByText("root comment")).toBeInTheDocument();
  }, 10000);

  it("同じタイプの兄弟コメントがグループ化されたコンテナ内に表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 1",
        commentType: "question",
        status: "active" as const,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 2",
        commentType: "question",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    // .child-group が存在し、その中にバッジと .group-content が含まれていることを確認
    await expect.element(page.getByText("question")).toBeInTheDocument();
    await expect.element(page.getByText("child 1")).toBeInTheDocument();
    await expect.element(page.getByText("child 2")).toBeInTheDocument();

    const groupContent = elem.shadowRoot?.querySelector(".group-content");
    expect(groupContent).not.toBeNull();
  });

  it("複数のルートコメントが表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root 1",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: null,
        content: "root 2",
        commentType: "question",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    await expect.element(page.getByText("root 1")).toBeInTheDocument();
    await expect.element(page.getByText("root 2")).toBeInTheDocument();
  });

  it("同じタイプの複数のルートコメントがグループ化されて表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root 1",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: null,
        content: "root 2",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    await expect.element(page.getByText("root 1")).toBeInTheDocument();
    await expect.element(page.getByText("root 2")).toBeInTheDocument();

    // ideaバッジは1つだけ表示されているはず
    const ideaBadges = await page.getByText("idea", { exact: true }).all();
    expect(ideaBadges.length).toBe(1);
  });

  it("コメントがクリックされたときにコールバックが実行されること", async () => {
    const comment = {
      id: "1",
      discussionId: "1",
      parentCommentId: null,
      content: "root comment",
      commentType: "idea",
      status: "active" as const,
    };
    elem.comments = [comment];
    await elem.updateComplete;

    let clickedComment: any = null;
    (elem as any).onCommentClick = (c: any) => {
      clickedComment = c;
    };

    await page.getByText("root comment").click();

    expect(clickedComment).toEqual(comment);
  });

  it("深い階層のコメントが表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "level 1",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "2",
        content: "level 2",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    await expect.element(page.getByText("root")).toBeInTheDocument();
    await expect.element(page.getByText("level 1")).toBeInTheDocument();
    await expect.element(page.getByText("level 2")).toBeInTheDocument();
  });

  it("ルートコメントのタイプが表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    await expect
      .element(page.getByText("idea", { exact: true }))
      .toBeInTheDocument();
  });

  it("同じタイプの兄弟コメントが正しく表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 1",
        commentType: "question",
        status: "active" as const,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 2",
        commentType: "question",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    await expect.element(page.getByText("child 1")).toBeInTheDocument();
    await expect.element(page.getByText("child 2")).toBeInTheDocument();

    // questionバッジは1つだけ表示されているはず（グループ化されているため）
    const questionBadges = page.getByText("question", { exact: true }).all();
    expect(questionBadges.length).toBe(1);
  });

  it("削除ボタンをクリックすると onCommentDelete が呼ばれること", async () => {
    let deletedId = "";
    elem.onCommentDelete = (id: string) => {
      deletedId = id;
    };
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    const card = page.getByText("root comment");
    await card.hover();

    const deleteButton = page.getByRole("button", { name: "delete" });
    await deleteButton.click();

    expect(deletedId).toBe("1");
  });

  it("AI生成ボタンをクリックすると onCommentGenerate が呼ばれること", async () => {
    let generatedId = "";
    elem.onCommentGenerate = (id: string) => {
      generatedId = id;
    };
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    await elem.updateComplete;

    const card = page.getByText("root comment");
    await card.hover();

    const generateButton = page.getByRole("button", { name: "generate" });
    await generateButton.click();

    expect(generatedId).toBe("1");
  });
});
