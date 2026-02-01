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
    issues: [],
    createdAt: "2026-01-04T00:00:00Z",
    archivedAt: null,
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
      container,
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
      container,
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
          @learning-comment-delete=${handleDelete}
        ></learning-comment-item>
      `,
      container,
    );

    const deleteButton = page.getByRole("button", { name: "delete" });
    await deleteButton.click();

    expect(deletedCommentId).toBe("1");
  });

  it("readonly が true の場合、アクションボタンを表示しない", async () => {
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          .readonly=${true}
        ></learning-comment-item>
      `,
      container,
    );

    await expect
      .element(page.getByRole("button", { name: "reply" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "edit" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "generate" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "delete" }))
      .not.toBeInTheDocument();
  });

  it("アーカイブ済みコメントでも、アーカイブがアンアーカイブボタンになり、他のアクションも表示される", async () => {
    const archivedComment: Comment = {
      ...mockComment,
      issues: [],
      archivedAt: "2026-01-05T00:00:00Z",
    };
    render(
      html`
        <learning-comment-item
          .comment=${archivedComment}
          .availableTypes=${availableTypes}
        ></learning-comment-item>
      `,
      container,
    );

    // 通常のアクションが表示されること
    await expect
      .element(page.getByRole("button", { name: "reply" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "edit" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "generate" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "delete" }))
      .toBeVisible();

    // アーカイブボタンではなく、アンアーカイブボタンが表示されること
    await expect
      .element(page.getByRole("button", { name: "archive", exact: true }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "unarchive", exact: true }))
      .toBeVisible();
  });

  it("自身がアーカイブされていないのに archived=true が渡された場合、アンアーカイブボタンを表示しない", async () => {
    // mockComment は archivedAt が null
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
          .archived=${true}
        ></learning-comment-item>
      `,
      container,
    );

    await expect
      .element(page.getByRole("button", { name: "unarchive", exact: true }))
      .not.toBeInTheDocument();
    // 代わりにアーカイブボタンが表示されているはず
    await expect
      .element(page.getByRole("button", { name: "archive", exact: true }))
      .toBeVisible();
  });

  it("status が proposed の場合、承諾ボタンと拒否ボタンを表示する", async () => {
    let acceptedComment: Comment | undefined;
    let rejectedComment: Comment | undefined;
    const handleAccept = (e: any) => {
      acceptedComment = e.comment;
    };
    const handleReject = (e: any) => {
      rejectedComment = e.comment;
    };
    const proposedComment: Comment = {
      ...mockComment,
      status: "proposed",
    };

    render(
      html`
        <learning-comment-item
          .comment=${proposedComment}
          .availableTypes=${availableTypes}
          @learning-proposed-comment-accept=${handleAccept}
          @learning-proposed-comment-reject=${handleReject}
        ></learning-comment-item>
      `,
      container,
    );

    // active 状態のボタンが表示されていないことを確認
    await expect
      .element(page.getByRole("button", { name: "reply" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "edit" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "generate" }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "delete" }))
      .not.toBeInTheDocument();

    // 承諾ボタンのテスト
    const acceptButton = page.getByRole("button", { name: "accept" });
    await expect.element(acceptButton).toBeVisible();
    await acceptButton.click();
    expect(acceptedComment?.id).toBe("1");

    // 拒否ボタンのテスト
    const rejectButton = page.getByRole("button", { name: "reject" });
    await expect.element(rejectButton).toBeVisible();
    await rejectButton.click();
    expect(rejectedComment?.id).toBe("1");
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
          @learning-comment-generate=${handleGenerate}
        ></learning-comment-item>
      `,
      container,
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
          @learning-comment-create=${handleCreate}
        ></learning-comment-item>
      `,
      container,
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

  it("アクションボタンが正しい順序（reply, edit, generate, archive, delete）で並んでいる", async () => {
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></learning-comment-item>
      `,
      container,
    );

    const buttons = page.getByRole("button");
    await expect.element(buttons.nth(0)).toHaveAttribute("aria-label", "reply");
    await expect.element(buttons.nth(1)).toHaveAttribute("aria-label", "edit");
    await expect
      .element(buttons.nth(2))
      .toHaveAttribute("aria-label", "generate");
    await expect
      .element(buttons.nth(3))
      .toHaveAttribute("aria-label", "archive");
    await expect
      .element(buttons.nth(4))
      .toHaveAttribute("aria-label", "delete");
  });

  it("アクションボタンが flex コンテナ内に配置されている", async () => {
    render(
      html`
        <learning-comment-item
          .comment=${mockComment}
          .availableTypes=${availableTypes}
        ></learning-comment-item>
      `,
      container,
    );

    const actionContainer = page.getByRole("group", { name: "Actions" });
    await expect.element(actionContainer).toBeVisible();
    await expect.element(actionContainer).toHaveStyle({ display: "flex" });
  });

  describe("touch device", () => {
    const originalMatchMedia = window.matchMedia;
    const originalMaxTouchPoints = navigator.maxTouchPoints;

    beforeEach(() => {
      // Mock touch device
      window.matchMedia = (query) =>
        ({
          matches: query === "(pointer: coarse)",
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as any;
      Object.defineProperty(navigator, "maxTouchPoints", {
        value: 1,
        configurable: true,
      });
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
      Object.defineProperty(navigator, "maxTouchPoints", {
        value: originalMaxTouchPoints,
        configurable: true,
      });
    });

    it("タッチデバイスでは focus ボタンが表示される", async () => {
      render(
        html`
          <learning-comment-item
            .comment=${mockComment}
            .availableTypes=${availableTypes}
          ></learning-comment-item>
        `,
        container,
      );
      await expect
        .element(page.getByRole("button", { name: "focus" }))
        .toBeVisible();
    });

    it("タッチデバイスではカードをクリックしても選択イベントが発火されない", async () => {
      let selectedId = "";
      const handleSelect = (e: any) => {
        selectedId = e.commentId;
      };
      render(
        html`
          <learning-comment-item
            .comment=${mockComment}
            .availableTypes=${availableTypes}
            @learning-comment-select=${handleSelect}
          ></learning-comment-item>
        `,
        container,
      );

      const card = page.getByText("This is a test comment");
      await card.click();

      expect(selectedId).toBe("");
    });

    it("タッチデバイスでは focus ボタンをクリックすると選択イベントが発火される", async () => {
      let selectedId = "";
      const handleSelect = (e: any) => {
        selectedId = e.commentId;
      };
      render(
        html`
          <learning-comment-item
            .comment=${mockComment}
            .availableTypes=${availableTypes}
            @learning-comment-select=${handleSelect}
          ></learning-comment-item>
        `,
        container,
      );

      const focusButton = page.getByRole("button", { name: "focus" });
      await focusButton.click();

      expect(selectedId).toBe("1");
    });

    it("タッチデバイスではアクションボタンが正しい順序（reply, edit, generate, archive, delete, focus）で並んでいる", async () => {
      render(
        html`
          <learning-comment-item
            .comment=${mockComment}
            .availableTypes=${availableTypes}
          ></learning-comment-item>
        `,
        container,
      );

      const buttons = page.getByRole("button");
      await expect
        .element(buttons.nth(0))
        .toHaveAttribute("aria-label", "reply");
      await expect
        .element(buttons.nth(1))
        .toHaveAttribute("aria-label", "edit");
      await expect
        .element(buttons.nth(2))
        .toHaveAttribute("aria-label", "generate");
      await expect
        .element(buttons.nth(3))
        .toHaveAttribute("aria-label", "archive");
      await expect
        .element(buttons.nth(4))
        .toHaveAttribute("aria-label", "delete");
      await expect
        .element(buttons.nth(5))
        .toHaveAttribute("aria-label", "focus");
    });
  });

  describe("non-touch device", () => {
    const originalMatchMedia = window.matchMedia;
    const originalMaxTouchPoints = navigator.maxTouchPoints;

    beforeEach(() => {
      // Mock non-touch device
      window.matchMedia = (query) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as any;
      Object.defineProperty(navigator, "maxTouchPoints", {
        value: 0,
        configurable: true,
      });
      // ontouchstart を一時的に消去（存在する場合）
      if ("ontouchstart" in window) {
        delete (window as any).ontouchstart;
      }
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
      Object.defineProperty(navigator, "maxTouchPoints", {
        value: originalMaxTouchPoints,
        configurable: true,
      });
    });

    it("非タッチデバイスでは focus ボタンが表示されない", async () => {
      render(
        html`
          <learning-comment-item
            .comment=${mockComment}
            .availableTypes=${availableTypes}
          ></learning-comment-item>
        `,
        container,
      );
      await expect
        .element(page.getByRole("button", { name: "focus" }))
        .not.toBeInTheDocument();
    });

    it("非タッチデバイスではカードをクリックすると選択イベントが発火される", async () => {
      let selectedId = "";
      const handleSelect = (e: any) => {
        selectedId = e.commentId;
      };
      render(
        html`
          <learning-comment-item
            .comment=${mockComment}
            .availableTypes=${availableTypes}
            @learning-comment-select=${handleSelect}
          ></learning-comment-item>
        `,
        container,
      );

      const card = page.getByText("This is a test comment");
      await card.click();

      expect(selectedId).toBe("1");
    });
  });
});
