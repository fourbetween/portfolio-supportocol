import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { CommentType } from "../../../../model/discussion";
import type { Rule } from "../../../../model/rule";
import type { CreateCommentPopupPresenter } from "./create";

describe("CreateCommentPopupPresenter", async () => {
  let elem: CreateCommentPopupPresenter;

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
      description: "反論を述べる",
      color: "#cf222e",
    },
  ];

  const mockRule: Rule = {
    id: "01234567890123456789012349",
    name: "議論ルール",
    description: "議論のルール説明文",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
    commentTypes: mockCommentTypes,
    commentTypePaths: [
      {
        // 主張（子）→ ルート（親）：ルートに対して主張で投稿可能
        childCommentTypeId: "01234567890123456789012351",
        parentCommentTypeId: "",
      },
      {
        // 根拠（子）→ 主張（親）：主張に対して根拠で返信可能
        childCommentTypeId: "01234567890123456789012352",
        parentCommentTypeId: "01234567890123456789012351",
      },
      {
        // 反論（子）→ 主張（親）：主張に対して反論で返信可能
        childCommentTypeId: "01234567890123456789012353",
        parentCommentTypeId: "01234567890123456789012351",
      },
    ],
  };

  beforeEach(() => {
    elem = document.createElement(
      "create-comment-popup-presenter"
    ) as CreateCommentPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("open()メソッドを呼ぶとダイアログが表示されること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.open();
    await elem.updateComplete;
    await expect.element(page.getByRole("dialog")).toBeVisible();
  });

  it("コメント種類選択フィールドが表示されること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.open();
    await elem.updateComplete;
    await expect
      .element(page.getByRole("combobox", { name: "コメント種類" }))
      .toBeVisible();
  });

  it("コメント内容入力フィールドが表示されること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.open();
    await elem.updateComplete;
    await expect
      .element(page.getByRole("textbox", { name: "内容" }))
      .toBeVisible();
  });

  it("作成ボタンをクリックするとonCreateが呼ばれること", async () => {
    const onCreate = vi.fn();
    elem.commentTypes = mockCommentTypes;
    elem.onCreate = onCreate;
    elem.open();
    await elem.updateComplete;

    const typeSelect = page.getByRole("combobox", { name: "コメント種類" });
    await userEvent.selectOptions(
      typeSelect.element(),
      "01234567890123456789012351"
    );

    const contentInput = page.getByRole("textbox", { name: "内容" });
    await userEvent.fill(contentInput.element(), "テストコメント");

    const createButton = page.getByRole("button", { name: "作成" });
    await userEvent.click(createButton.element());

    expect(onCreate).toHaveBeenCalledWith({
      commentTypeId: "01234567890123456789012351",
      content: "テストコメント",
    });
  });

  it("キャンセルボタンをクリックするとclose()が呼ばれること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.open();
    await elem.updateComplete;

    const closeSpy = vi.spyOn(elem, "close");
    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await userEvent.click(cancelButton.element());

    expect(closeSpy).toHaveBeenCalled();
  });

  it("内容が空の場合はonCreateが呼ばれないこと", async () => {
    const onCreate = vi.fn();
    elem.commentTypes = mockCommentTypes;
    elem.onCreate = onCreate;
    elem.open();
    await elem.updateComplete;

    const createButton = page.getByRole("button", { name: "作成" });
    await userEvent.click(createButton.element());

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("親コメントがある場合にタイトルに返信と表示されること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.parentCommentId = "parent123";
    elem.open();
    await elem.updateComplete;

    await expect.element(page.getByText("コメントを返信")).toBeVisible();
  });

  it("親コメントがない場合にタイトルに新規作成と表示されること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.parentCommentId = null;
    elem.open();
    await elem.updateComplete;

    await expect.element(page.getByText("コメントを追加")).toBeVisible();
  });

  it("openWithContent()メソッドで初期内容を設定してダイアログを開けること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.openWithContent("ノートからの内容");
    await elem.updateComplete;

    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .element(page.getByRole("textbox", { name: "内容" }))
      .toHaveValue("ノートからの内容");
  });

  it("ルールが設定されている場合、許可されたコメント種類のみが選択肢に表示されること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.rule = mockRule;
    elem.fromCommentTypeId = "01234567890123456789012351"; // 主張からの返信
    elem.open();
    await elem.updateComplete;

    const selectElement = elem.shadowRoot?.querySelector(
      "#comment-type"
    ) as HTMLSelectElement;
    const options = Array.from(selectElement?.options || []).filter(
      (opt) => opt.value !== ""
    );

    // 主張からは根拠と反論のみ許可
    expect(options.length).toBe(2);
    expect(options.map((o) => o.textContent)).toEqual(["根拠", "反論"]);
  });

  it("ルートコメント追加時に許可されたコメント種類のみが選択肢に表示されること", async () => {
    elem.commentTypes = mockCommentTypes;
    elem.rule = mockRule;
    elem.fromCommentTypeId = ""; // ルートコメント
    elem.open();
    await elem.updateComplete;

    const selectElement = elem.shadowRoot?.querySelector(
      "#comment-type"
    ) as HTMLSelectElement;
    const options = Array.from(selectElement?.options || []).filter(
      (opt) => opt.value !== ""
    );

    // ルートからは主張のみ許可
    expect(options.length).toBe(1);
    expect(options[0].textContent).toBe("主張");
  });
});
