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
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "child idea 1",
        commentType: "idea",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "child question 1",
        commentType: "question",
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "1",
        content: "child idea 2",
        commentType: "idea",
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

  it("同じタイプの兄弟コメントがグループ化されたコンテナ内に表示されること", async () => {
    elem.comments = [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "root",
        commentType: "idea",
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 1",
        commentType: "question",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 2",
        commentType: "question",
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
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: null,
        content: "root 2",
        commentType: "question",
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
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: null,
        content: "root 2",
        commentType: "idea",
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
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "level 1",
        commentType: "idea",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "2",
        content: "level 2",
        commentType: "idea",
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
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 1",
        commentType: "question",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "child 2",
        commentType: "question",
      },
    ];
    await elem.updateComplete;

    await expect.element(page.getByText("child 1")).toBeInTheDocument();
    await expect.element(page.getByText("child 2")).toBeInTheDocument();

    // questionバッジは1つだけ表示されているはず（グループ化されているため）
    const questionBadges = page.getByText("question", { exact: true }).all();
    expect(questionBadges.length).toBe(1);
  });
});
