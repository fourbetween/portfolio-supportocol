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
      parentCommentId: "",
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

  it("コメントをクリックするとフォーカスボタンが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;

    const focusButtons = elem.shadowRoot?.querySelectorAll(".btn-focus");
    expect(focusButtons?.length).toBeGreaterThan(0);
  });

  it("フォーカスボタンクリック時にonFocusCommentが呼ばれること", async () => {
    const onFocusComment = vi.fn();
    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    elem.onFocusComment = onFocusComment;
    await elem.updateComplete;

    const focusButton = elem.shadowRoot?.querySelector(".btn-focus");
    (focusButton as HTMLElement)?.click();

    expect(onFocusComment).toHaveBeenCalledWith("01234567890123456789012360");
  });

  it("focusedCommentIdが設定されると祖先コメントセクションが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    elem.focusedCommentId = "01234567890123456789012361"; // 根拠コメント1（ルートコメント1の子）
    await elem.updateComplete;

    const ancestorSection =
      elem.shadowRoot?.querySelector(".ancestor-comments");
    expect(ancestorSection).not.toBeNull();
    await expect.element(page.getByText("ルートコメント1")).toBeVisible();
  });

  it("フォーカスモードでフォーカスコメントが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    elem.focusedCommentId = "01234567890123456789012361"; // 根拠コメント1
    await elem.updateComplete;

    const focusedSection = elem.shadowRoot?.querySelector(
      ".focused-comment-section"
    );
    expect(focusedSection).not.toBeNull();
    await expect.element(page.getByText("根拠コメント1")).toBeVisible();
  });

  it("フォーカスモードでフォーカス解除ボタンが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    elem.focusedCommentId = "01234567890123456789012361";
    await elem.updateComplete;

    await expect
      .element(page.getByRole("button", { name: "フォーカス解除" }))
      .toBeVisible();
  });

  it("フォーカス解除ボタンクリック時にonClearFocusが呼ばれること", async () => {
    const onClearFocus = vi.fn();
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    elem.focusedCommentId = "01234567890123456789012361";
    elem.onClearFocus = onClearFocus;
    await elem.updateComplete;

    await page.getByRole("button", { name: "フォーカス解除" }).click();

    expect(onClearFocus).toHaveBeenCalled();
  });

  it("祖先コメントにフォーカスボタンが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = mockComments;
    elem.commentTypes = mockCommentTypes;
    elem.focusedCommentId = "01234567890123456789012361";
    await elem.updateComplete;

    const ancestorSection =
      elem.shadowRoot?.querySelector(".ancestor-comments");
    const focusButton = ancestorSection?.querySelector(".btn-focus");
    expect(focusButton).not.toBeNull();
  });

  it("コメントの深さに応じてdata-depth属性が設定されること", async () => {
    // 深さ3のコメントを作成（ルート -> 子 -> 孫）
    const deepComments: Comment[] = [
      {
        id: "depth0",
        discussionId: "01234567890123456789012348",
        parentCommentId: "",
        commentTypeId: "01234567890123456789012351",
        content: "深さ0のコメント",
        postedBy: "01234567890123456789012346",
        postedAt: "2024-01-01T10:00:00Z",
        status: "assigned",
      },
      {
        id: "depth1",
        discussionId: "01234567890123456789012348",
        parentCommentId: "depth0",
        commentTypeId: "01234567890123456789012352",
        content: "深さ1のコメント",
        postedBy: "01234567890123456789012346",
        postedAt: "2024-01-01T11:00:00Z",
        status: "assigned",
      },
      {
        id: "depth2",
        discussionId: "01234567890123456789012348",
        parentCommentId: "depth1",
        commentTypeId: "01234567890123456789012352",
        content: "深さ2のコメント",
        postedBy: "01234567890123456789012346",
        postedAt: "2024-01-01T12:00:00Z",
        status: "assigned",
      },
    ];

    elem.discussion = mockDiscussion;
    elem.comments = deepComments;
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;

    const depth0Comment = elem.shadowRoot?.querySelector(
      '.comment-item[data-depth="0"]'
    );
    const depth1Comment = elem.shadowRoot?.querySelector(
      '.comment-item[data-depth="1"]'
    );
    const depth2Comment = elem.shadowRoot?.querySelector(
      '.comment-item[data-depth="2"]'
    );

    expect(depth0Comment).not.toBeNull();
    expect(depth1Comment).not.toBeNull();
    expect(depth2Comment).not.toBeNull();
  });

  it("コメントにステータス変更ボタンが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;

    const statusButton = elem.shadowRoot?.querySelector(".btn-status");
    expect(statusButton).not.toBeNull();
  });

  it("ステータス変更ボタンクリック時にonChangeStatusが呼ばれること", async () => {
    const onChangeStatus = vi.fn();
    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    elem.onChangeStatus = onChangeStatus;
    await elem.updateComplete;

    const statusButton = elem.shadowRoot?.querySelector(".btn-status");
    (statusButton as HTMLElement)?.click();

    expect(onChangeStatus).toHaveBeenCalledWith("01234567890123456789012360");
  });

  it("コメントのステータスバッジが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;

    const statusBadge = elem.shadowRoot?.querySelector(".comment-status-badge");
    expect(statusBadge).not.toBeNull();
    expect(statusBadge?.textContent?.trim()).toBe("割り当て済み");
  });

  it("ノートパネルが表示されること", async () => {
    elem.discussion = mockDiscussion;
    await elem.updateComplete;

    const notesPanel = elem.shadowRoot?.querySelector("notes-panel-presenter");
    expect(notesPanel).not.toBeNull();
  });

  it("コメントに指摘ボタンが表示されること", async () => {
    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    await elem.updateComplete;

    const issueButton = elem.shadowRoot?.querySelector(".btn-issue");
    expect(issueButton).not.toBeNull();
  });

  it("指摘ボタンクリック時にonAddIssueが呼ばれること", async () => {
    const onAddIssue = vi.fn();
    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    elem.onAddIssue = onAddIssue;
    await elem.updateComplete;

    const issueButton = elem.shadowRoot?.querySelector(".btn-issue");
    (issueButton as HTMLElement)?.click();

    expect(onAddIssue).toHaveBeenCalledWith("01234567890123456789012360");
  });

  it("コメントに紐づく指摘がある場合、指摘数バッジが表示されること", async () => {
    const mockIssues = [
      {
        id: "01234567890123456789012370",
        commentId: "01234567890123456789012360",
        issueType: "contradiction" as const,
        description: "矛盾の指摘",
        createdBy: "01234567890123456789012346",
        createdAt: "2024-01-01T14:00:00Z",
      },
      {
        id: "01234567890123456789012371",
        commentId: "01234567890123456789012360",
        issueType: "circular_logic" as const,
        description: "循環論法の指摘",
        createdBy: "01234567890123456789012346",
        createdAt: "2024-01-01T15:00:00Z",
      },
    ];

    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    elem.issues = mockIssues;
    await elem.updateComplete;

    const issueBadge = elem.shadowRoot?.querySelector(".issue-count-badge");
    expect(issueBadge).not.toBeNull();
    expect(issueBadge?.textContent?.trim()).toBe("2");
  });

  it("指摘数バッジクリック時にonShowIssuesが呼ばれること", async () => {
    const onShowIssues = vi.fn();
    const mockIssues = [
      {
        id: "01234567890123456789012370",
        commentId: "01234567890123456789012360",
        issueType: "contradiction" as const,
        description: "矛盾の指摘",
        createdBy: "01234567890123456789012346",
        createdAt: "2024-01-01T14:00:00Z",
      },
    ];

    elem.discussion = mockDiscussion;
    elem.comments = [mockComments[0]];
    elem.commentTypes = mockCommentTypes;
    elem.issues = mockIssues;
    elem.onShowIssues = onShowIssues;
    await elem.updateComplete;

    const issueBadge = elem.shadowRoot?.querySelector(".issue-count-badge");
    (issueBadge as HTMLElement)?.click();

    expect(onShowIssues).toHaveBeenCalledWith("01234567890123456789012360");
  });
});
