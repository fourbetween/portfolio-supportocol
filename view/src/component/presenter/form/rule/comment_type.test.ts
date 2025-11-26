import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { CommentTypeFormPresenter } from "./comment_type";

describe("CommentTypeFormPresenter", async () => {
  let elem: CommentTypeFormPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "comment-type-form-presenter"
    ) as CommentTypeFormPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("名前入力フィールドが表示されること", async () => {
    await elem.updateComplete;
    await expect
      .element(page.getByRole("textbox", { name: "名前" }))
      .toBeVisible();
  });

  it("説明入力フィールドが表示されること", async () => {
    await elem.updateComplete;
    await expect
      .element(page.getByRole("textbox", { name: "説明" }))
      .toBeVisible();
  });

  it("色選択ボタンが6つ表示されること", async () => {
    await elem.updateComplete;
    const colorButtons = page.getByRole("button").elements();
    expect(colorButtons.length).toBe(6);
  });

  it("名前を入力するとchangeイベントが発火すること", async () => {
    const onChange = vi.fn();
    elem.addEventListener("change", onChange);
    await elem.updateComplete;

    const nameInput = page.getByRole("textbox", { name: "名前" });
    await userEvent.type(nameInput.element(), "テスト名");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.detail.name).toBe("テスト名");
  });

  it("初期値が正しく表示されること", async () => {
    elem.name = "初期名前";
    elem.description = "初期説明";
    elem.selectedColorIndex = 2;
    await elem.updateComplete;

    await expect
      .element(page.getByRole("textbox", { name: "名前" }))
      .toHaveValue("初期名前");
    await expect
      .element(page.getByRole("textbox", { name: "説明" }))
      .toHaveValue("初期説明");
  });
});
