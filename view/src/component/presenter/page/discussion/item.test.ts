import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { Comment, CommentType } from "../../../../model/discussion";
import type { ItemDiscussionPagePresenter } from "./item";

describe("ItemDiscussionPagePresenter", async () => {
  let elem: ItemDiscussionPagePresenter;

  beforeEach(() => {
    elem = document.createElement(
      "item-discussion-page-presenter"
    ) as ItemDiscussionPagePresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  const mockDiscussion = {
    id: "01234567890123456789012348",
    theme: "テスト議論のテーマ",
    background: "テスト背景の説明",
    conclusion: "テスト結論",
    ruleId: "01234567890123456789012349",
    visibilityLevel: "everyone" as const,
    commentPermissionLevel: "everyone" as const,
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
    status: "open" as const,
  };

  const mockCommentTypes: CommentType[] = [
    {
      id: "01234567890123456789012351",
      name: "主張",
      description: "議論の主張を述べる",
      color: "#0969da",
    },
    {
      id: "01234567890123456789012352",
      name: "根拠",
      description: "主張を裏付ける根拠を述べる",
      color: "#2da44e",
    },
    {
      id: "01234567890123456789012353",
      name: "反論",
      description: "主張や根拠に対する反論を述べる",
      color: "#cf222e",
    },
  ];

  const mockComments: Comment[] = [
    {
      id: "01234567890123456789012360",
      discussionId: "01234567890123456789012348",
      parentCommentId: null,
      commentTypeId: "01234567890123456789012351",
      content: "ルートコメント1",
      postedBy: "01234567890123456789012346",
      postedAt: "2024-01-01T10:00:00Z",
      status: "assigned",
    },
    {
      id: "01234567890123456789012361",
      discussionId: "01234567890123456789012348",
      parentCommentId: "01234567890123456789012360",
      commentTypeId: "01234567890123456789012352",
      content: "根拠コメント1",
      postedBy: "01234567890123456789012346",
      postedAt: "2024-01-01T11:00:00Z",
      status: "assigned",
    },
    {
      id: "01234567890123456789012362",
      discussionId: "01234567890123456789012348",
      parentCommentId: "01234567890123456789012360",
      commentTypeId: "01234567890123456789012352",
      content: "根拠コメント2",
      postedBy: "01234567890123456789012346",
      postedAt: "2024-01-01T12:00:00Z",
      status: "assigned",
    },
    {
      id: "01234567890123456789012363",
      discussionId: "01234567890123456789012348",
      parentCommentId: "01234567890123456789012360",
      commentTypeId: "01234567890123456789012353",
      content: "反論コメント1",
      postedBy: "01234567890123456789012346",
      postedAt: "2024-01-01T13:00:00Z",
      status: "assigned",
    },
  ];

  it("議論のテーマが表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("テスト議論のテーマ");
  });

  it("議論の背景が表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;
    await expect.element(page.getByText("テスト背景の説明")).toBeVisible();
  });

  it("議論の結論が表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;
    await expect.element(page.getByText("テスト結論")).toBeVisible();
  });

  it("コメントセクションが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;
    await expect
      .element(page.getByRole("heading", { name: "コメント" }))
      .toBeVisible();
  });

  it("ルートコメントが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;
    await expect.element(page.getByText("ルートコメント1")).toBeVisible();
  });

  it("子コメントがコメント種類ごとにグループ化されて表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;

    // 根拠グループのヘッダーが表示される
    const kokyoGroup = elem.shadowRoot?.querySelector(
      '.child-comment-group[data-type-id="01234567890123456789012352"]'
    );
    expect(kokyoGroup).not.toBeNull();

    // 根拠グループ内のコメントが表示される
    await expect.element(page.getByText("根拠コメント1")).toBeVisible();
    await expect.element(page.getByText("根拠コメント2")).toBeVisible();

    // 反論グループのヘッダーが表示される
    const hanronGroup = elem.shadowRoot?.querySelector(
      '.child-comment-group[data-type-id="01234567890123456789012353"]'
    );
    expect(hanronGroup).not.toBeNull();

    // 反論グループ内のコメントが表示される
    await expect.element(page.getByText("反論コメント1")).toBeVisible();
  });

  it("コメントがない場合はメッセージが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = [];
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;
    await expect.element(page.getByText("コメントがありません")).toBeVisible();
  });

  it("コメント追加ボタンが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    await expect
      .element(page.getByRole("button", { name: "コメントを追加" }))
      .toBeVisible();
  });

  it("コメント追加ボタンクリック時にonAddCommentが呼ばれること", async () => {
    const onAddComment = vi.fn();
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    elem.onAddComment = onAddComment;

    await page.getByRole("button", { name: "コメントを追加" }).click();

    expect(onAddComment).toHaveBeenCalledWith(null);
  });

  it("コメントに返信ボタンが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;
    const replyButtons = elem.shadowRoot?.querySelectorAll(".btn-reply");
    expect(replyButtons?.length).toBeGreaterThan(0);
  });

  it("返信ボタンクリック時にonAddCommentが親コメントIDとともに呼ばれること", async () => {
    const onAddComment = vi.fn();
    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    elem.onAddComment = onAddComment;
    await elem.updateComplete;

    const replyButton = elem.shadowRoot?.querySelector(".btn-reply");
    (replyButton as HTMLElement)?.click();

    expect(onAddComment).toHaveBeenCalledWith("01234567890123456789012360");
  });
});
