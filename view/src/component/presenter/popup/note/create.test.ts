import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./create";
import type { CreateNotePopupPresenter } from "./create";

describe("CreateNotePopupPresenter", () => {
  let elem: CreateNotePopupPresenter;

  beforeEach(async () => {
    elem = document.createElement(
      "create-note-popup-presenter"
    ) as CreateNotePopupPresenter;
    document.body.appendChild(elem);
    await elem.updateComplete;
    elem.open();
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルとして「ノート作成」が表示されること", async () => {
    await expect.element(page.getByText("ノート作成")).toBeInTheDocument();
  });

  it("内容入力欄が表示されること", async () => {
    await expect.element(page.getByLabelText("内容")).toBeInTheDocument();
  });

  it("保存ボタンが表示されること", async () => {
    await expect
      .element(page.getByRole("button", { name: "保存する" }))
      .toBeInTheDocument();
  });
});
