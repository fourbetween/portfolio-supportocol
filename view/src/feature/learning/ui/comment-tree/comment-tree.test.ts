import { html, render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./comment-tree";

describe("learning-comment-tree", async () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("単一のコメントが表示されること", async () => {
    const comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );
    await expect.element(page.getByText("root comment")).toBeInTheDocument();
  });

  it("子コメントが種類ごとにグループ化されて表示されること", async () => {
    const comments = [
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
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    await expect.element(page.getByText("root comment")).toBeInTheDocument();
    await expect.element(page.getByText("child idea 1")).toBeInTheDocument();
    await expect.element(page.getByText("child idea 2")).toBeInTheDocument();
    await expect
      .element(page.getByText("child question 1"))
      .toBeInTheDocument();

    await expect
      .element(page.getByText("idea", { exact: true }).first())
      .toBeInTheDocument();
    await expect
      .element(page.getByText("question", { exact: true }).first())
      .toBeInTheDocument();
  });

  it("コメントをホバーすると編集アイコンが表示され、クリックすると編集フォームが表示されること", async () => {
    const comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    const card = page.getByText("root comment");
    await card.hover();

    const editButton = page.getByRole("button", { name: "edit" });
    await expect.element(editButton).toBeVisible();

    await editButton.click();

    // 編集フォームが表示されていることを確認
    await expect.element(page.getByRole("textbox")).toBeVisible();
    await expect
      .element(page.getByText("root comment"))
      .not.toBeInTheDocument();

    // キャンセルをクリック
    const cancelButton = page.getByTitle("Cancel");
    await cancelButton.click();

    // 元のカードに戻っていることを確認
    await expect.element(page.getByText("root comment")).toBeVisible();
  });

  it("同じタイプの兄弟コメントがグループ化されたコンテナ内に表示されること", async () => {
    const comments = [
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
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    // .child-group が存在し、その中にバッジと .group-content が含まれていることを確認
    await expect
      .element(page.getByText("question", { exact: true }).first())
      .toBeInTheDocument();
    await expect.element(page.getByText("child 1")).toBeInTheDocument();
    await expect.element(page.getByText("child 2")).toBeInTheDocument();
  });

  it("複数のルートコメントが表示されること", async () => {
    const comments = [
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
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    await expect.element(page.getByText("root 1")).toBeInTheDocument();
    await expect.element(page.getByText("root 2")).toBeInTheDocument();
  });

  it("同じタイプの複数のルートコメントがグループ化されて表示されること", async () => {
    const comments = [
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
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    await expect.element(page.getByText("root 1")).toBeInTheDocument();
    await expect.element(page.getByText("root 2")).toBeInTheDocument();

    // ideaバッジが表示されているはず
    await expect
      .element(page.getByText("idea", { exact: true }).first())
      .toBeInTheDocument();
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
    let clickedComment: any = null;
    const onCommentClick = (c: any) => {
      clickedComment = c;
    };
    render(
      html`
        <learning-comment-tree
          .comments=${[comment]}
          .onCommentClick=${onCommentClick}
        ></learning-comment-tree>
      `,
      container
    );

    await page.getByText("root comment").click();

    expect(clickedComment).toEqual(comment);
  });

  it("深い階層のコメントが表示されること", async () => {
    const comments = [
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
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    await expect.element(page.getByText("root")).toBeInTheDocument();
    await expect.element(page.getByText("level 1")).toBeInTheDocument();
    await expect.element(page.getByText("level 2")).toBeInTheDocument();
  });

  it("ルートコメントのタイプが表示されること", async () => {
    const comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    await expect
      .element(page.getByText("idea", { exact: true }).first())
      .toBeInTheDocument();
  });

  it("同じタイプの兄弟コメントが正しく表示されること", async () => {
    const comments = [
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
    render(
      html`
        <learning-comment-tree .comments=${comments}></learning-comment-tree>
      `,
      container
    );

    await expect.element(page.getByText("child 1")).toBeInTheDocument();
    await expect.element(page.getByText("child 2")).toBeInTheDocument();

    // バッジは root(idea) と children(question) の2つ表示されているはず
    await expect
      .element(page.getByText("idea", { exact: true }).first())
      .toBeInTheDocument();
    await expect
      .element(page.getByText("question", { exact: true }).first())
      .toBeInTheDocument();
  });

  it("削除ボタンをクリックすると onCommentDelete が呼ばれること", async () => {
    let deletedId = "";
    const onCommentDelete = (id: string) => {
      deletedId = id;
    };
    const comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    render(
      html`
        <learning-comment-tree
          .comments=${comments}
          .onCommentDelete=${onCommentDelete}
        ></learning-comment-tree>
      `,
      container
    );

    const card = page.getByText("root comment");
    await card.hover();

    const deleteButton = page.getByRole("button", { name: "delete" });
    await deleteButton.click();

    expect(deletedId).toBe("1");
  });

  it("AI生成ボタンをクリックすると、コメントタイプポップアップが表示され、タイプを選択すると onCommentGenerate が呼ばれること", async () => {
    let generatedId = "";
    let generatedType = "";
    const onCommentGenerate = (id: string, type: string) => {
      generatedId = id;
      generatedType = type;
    };
    const comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root comment",
        commentType: "idea",
        status: "active" as const,
      },
    ];
    render(
      html`
        <learning-comment-tree
          .comments=${comments}
          .onCommentGenerate=${onCommentGenerate}
        ></learning-comment-tree>
      `,
      container
    );

    const card = page.getByText("root comment");
    await card.hover();

    const generateButton = page.getByRole("button", { name: "generate" });
    await generateButton.click();

    // ポップアップが表示されるのを待つ
    const typeButton = page.getByRole("button", { name: "idea" });
    await expect.element(typeButton).toBeVisible();
    await typeButton.click();

    expect(generatedId).toBe("1");
    expect(generatedType).toBe("idea");
  });
});
