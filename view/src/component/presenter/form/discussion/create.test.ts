import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { CreateDiscussionFormPresenter } from "./create";

describe("CreateDiscussionFormPresenter", () => {
  let elem: CreateDiscussionFormPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-discussion-form-presenter"
    ) as CreateDiscussionFormPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルとして「議論の新規作成」が表示されること", async () => {
    await expect.element(page.getByText("議論の新規作成")).toBeInTheDocument();
  });

  it("テーマ入力欄が表示されること", async () => {
    await expect.element(page.getByLabelText("テーマ")).toBeInTheDocument();
  });

  it("背景入力欄が表示されること", async () => {
    await expect.element(page.getByLabelText("背景")).toBeInTheDocument();
  });

  it("ルール選択欄が表示されること", async () => {
    await expect.element(page.getByLabelText("ルール")).toBeInTheDocument();
  });

  it("公開レベル選択欄が表示されること", async () => {
    await expect.element(page.getByLabelText("公開レベル")).toBeInTheDocument();
  });

  it("コメント許可レベル選択欄が表示されること", async () => {
    await expect
      .element(page.getByLabelText("コメント許可レベル"))
      .toBeInTheDocument();
  });

  it("作成ボタンが表示されること", async () => {
    await expect
      .element(page.getByRole("button", { name: "議論を作成" }))
      .toBeInTheDocument();
  });
});
