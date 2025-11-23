import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { CreateDiscussionPopupPresenter } from "./create";

describe("CreateDiscussionPopupPresenter", () => {
  let elem: CreateDiscussionPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-discussion-popup-presenter"
    ) as CreateDiscussionPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルとして「議論の新規作成」が表示されること", async () => {
    elem.open();
    await expect.element(page.getByText("議論の新規作成")).toBeInTheDocument();
  });

  it("テーマ入力欄が表示されること", async () => {
    elem.open();
    await expect.element(page.getByLabelText("テーマ")).toBeInTheDocument();
  });

  it("背景入力欄が表示されること", async () => {
    elem.open();
    await expect.element(page.getByLabelText("背景")).toBeInTheDocument();
  });

  it("ルール選択欄が表示されること", async () => {
    elem.open();
    await expect.element(page.getByLabelText("ルール")).toBeInTheDocument();
  });

  it("公開レベル選択欄が表示されること", async () => {
    elem.open();
    await expect.element(page.getByLabelText("公開レベル")).toBeInTheDocument();
  });

  it("コメント許可レベル選択欄が表示されること", async () => {
    elem.open();
    await expect
      .element(page.getByLabelText("コメント許可レベル"))
      .toBeInTheDocument();
  });

  it("作成ボタンが表示されること", async () => {
    elem.open();
    await expect
      .element(page.getByRole("button", { name: "議論を作成" }))
      .toBeInTheDocument();
  });

  it("作成ボタンをクリックするとonCreateが呼ばれること", async () => {
    const onCreate = vi.fn();
    elem.onCreate = onCreate;
    elem.open();

    await page.getByLabelText("テーマ").fill("新しい議論");
    await page.getByLabelText("背景").fill("議論の背景");
    await page.getByLabelText("ルール").selectOptions("rule1");
    await page.getByLabelText("公開レベル").selectOptions("everyone");
    await page.getByLabelText("コメント許可レベル").selectOptions("everyone");

    await page.getByRole("button", { name: "議論を作成" }).click();

    expect(onCreate).toHaveBeenCalledWith({
      theme: "新しい議論",
      background: "議論の背景",
      ruleId: "rule1",
      visibilityLevel: "everyone",
      commentPermissionLevel: "everyone",
    });
  });
});
