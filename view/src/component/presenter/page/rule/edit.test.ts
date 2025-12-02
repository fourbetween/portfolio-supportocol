import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { Rule } from "../../../../model/rule";
import type { EditRulePagePresenter } from "./edit";

describe("EditRulePagePresenter", async () => {
  let elem: EditRulePagePresenter;

  const mockRule: Rule = {
    id: "01234567890123456789012345",
    name: "基本的な議論",
    description: "論理的な議論を行うための基本的なルールセットです。",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
    commentTypes: [
      {
        id: "01234567890123456789012347",
        no: 0,
        name: "主張",
        description: "自分の意見や提案を述べるコメント",
        color: "#0969da",
        root: true,
      },
      {
        id: "01234567890123456789012348",
        no: 1,
        name: "根拠",
        description: "主張を裏付ける根拠",
        color: "#1a7f37",
        root: false,
      },
    ],
    commentTypePaths: [
      {
        childCommentTypeId: "01234567890123456789012347",
        parentCommentTypeId: "01234567890123456789012348",
      },
    ],
  };

  beforeEach(() => {
    elem = document.createElement(
      "edit-rule-page-presenter"
    ) as EditRulePagePresenter;
    elem.rule = mockRule;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("ページタイトルが表示されること", async () => {
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toHaveTextContent("ルール編集");
  });

  it("ルール名が入力欄に表示されること", async () => {
    const input = page.getByLabelText("ルール名");
    await expect.element(input).toHaveValue("基本的な議論");
  });

  it("ルール説明が入力欄に表示されること", async () => {
    const textarea = page.getByRole("textbox", { name: "説明" });
    await expect
      .element(textarea)
      .toHaveValue("論理的な議論を行うための基本的なルールセットです。");
  });

  it("コメント種類一覧が表示されること", async () => {
    // コメント種類一覧セクションで名前が表示されていることを確認
    const list = page.getByRole("list");
    await expect.element(list.getByText("主張")).toBeVisible();
    await expect.element(list.getByText("根拠")).toBeVisible();
  });

  it("経路のチェックボックスが表示されること", async () => {
    // 主張から根拠への経路が設定されているので、チェックボックスがチェックされているはず
    const checkbox = page.getByRole("checkbox", { name: "主張 → 根拠" });
    await expect.element(checkbox).toBeVisible();
    await expect.element(checkbox).toBeChecked();
  });

  it("保存ボタンをクリックするとonSaveが呼ばれること", async () => {
    const onSave = vi.fn();
    elem.onSave = onSave;

    const saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    expect(onSave).toHaveBeenCalled();
  });

  it("キャンセルボタンをクリックするとonCancelが呼ばれること", async () => {
    const onCancel = vi.fn();
    elem.onCancel = onCancel;

    const cancelButton = page.getByRole("button", { name: "キャンセル" });
    await cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("ルール名を変更して保存すると変更された名前が渡されること", async () => {
    const onSave = vi.fn();
    elem.onSave = onSave;
    await elem.updateComplete;

    const nameInput = page.getByLabelText("ルール名");
    await userEvent.clear(nameInput.element());
    await userEvent.fill(nameInput.element(), "更新されたルール名");
    await elem.updateComplete;

    const saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: "更新されたルール名" })
    );
  });

  it("経路チェックボックスを変更すると経路が更新されること", async () => {
    const onSave = vi.fn();
    elem.onSave = onSave;
    await elem.updateComplete;

    // 主張から主張への経路をチェック（現在は未チェック）
    const checkbox = page.getByRole("checkbox", { name: "主張 → 主張" });
    await checkbox.click();
    await elem.updateComplete;

    const saveButton = page.getByRole("button", { name: "保存" });
    await saveButton.click();

    // 新しい経路が追加されていることを確認
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        commentTypePaths: expect.arrayContaining([
          {
            childCommentTypeId: "01234567890123456789012347",
            parentCommentTypeId: "01234567890123456789012347",
          },
        ]),
      })
    );
  });

  it("コメント種類を追加ボタンが表示されること", async () => {
    const addButton = page.getByRole("button", {
      name: "+ コメント種類を追加",
    });
    await expect.element(addButton).toBeVisible();
  });

  it("コメント種類を追加すると一覧に反映されること", async () => {
    await elem.updateComplete;

    // 追加ボタンをクリック
    const addButton = page.getByRole("button", {
      name: "+ コメント種類を追加",
    });
    await addButton.click();
    await elem.updateComplete;

    // ポップアップが開いていることを確認
    await expect.element(page.getByRole("dialog")).toBeVisible();

    // フォームに入力（ポップアップ内のフィールドを特定）
    const nameInput = page.getByRole("textbox", { name: "名前" });
    await userEvent.fill(nameInput.element(), "質問");

    // 追加ボタンをクリック
    const submitButton = page.getByRole("button", {
      name: "追加",
      exact: true,
    });
    await submitButton.click();
    await elem.updateComplete;

    // 一覧に反映されていることを確認
    const list = page.getByRole("list");
    await expect.element(list.getByText("質問")).toBeVisible();
  });

  it("コメント種類に編集ボタンが表示されること", async () => {
    const editButtons = page.getByRole("button", { name: "編集" });
    // 2つのコメント種類があるので、2つの編集ボタンがあるはず
    await expect.element(editButtons.first()).toBeVisible();
  });

  it("コメント種類を編集すると一覧に反映されること", async () => {
    await elem.updateComplete;

    // 編集ボタンをクリック（最初のコメント種類）
    const editButton = page.getByRole("button", { name: "編集" }).first();
    await editButton.click();
    await elem.updateComplete;

    // ポップアップが開いていることを確認
    await expect.element(page.getByRole("dialog")).toBeVisible();

    // 名前を変更
    const nameInput = page.getByRole("textbox", { name: "名前" });
    await userEvent.clear(nameInput.element());
    await userEvent.fill(nameInput.element(), "更新された主張");

    // 更新ボタンをクリック
    const updateButton = page.getByRole("button", { name: "更新" });
    await updateButton.click();
    await elem.updateComplete;

    // 一覧に反映されていることを確認
    const list = page.getByRole("list");
    await expect.element(list.getByText("更新された主張")).toBeVisible();
  });

  it("コメント種類に削除ボタンが表示されること", async () => {
    const deleteButtons = page.getByRole("button", { name: "削除" });
    // 2つのコメント種類があるので、2つの削除ボタンがあるはず
    await expect.element(deleteButtons.first()).toBeVisible();
  });

  it("コメント種類を削除すると一覧から消えること", async () => {
    await elem.updateComplete;

    // 削除ボタンをクリック（最初のコメント種類「主張」）
    const deleteButton = page.getByRole("button", { name: "削除" }).first();
    await deleteButton.click();
    await elem.updateComplete;

    // 一覧から消えていることを確認
    const list = page.getByRole("list");
    await expect.element(list.getByText("主張")).not.toBeInTheDocument();
    // 根拠はまだ残っている
    await expect.element(list.getByText("根拠")).toBeVisible();
  });
});
