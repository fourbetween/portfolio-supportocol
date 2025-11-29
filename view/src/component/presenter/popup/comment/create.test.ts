import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { CommentType } from "../../../../model/discussion";
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
  ];

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
});
