import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./create";
import type { CreateCommentPopupPresenter } from "./create";

describe("CreateCommentPopupPresenter", async () => {
  let elem: CreateCommentPopupPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "create-comment-popup-presenter"
    ) as CreateCommentPopupPresenter;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("タイトルが「コメント投稿」であること", async () => {
    await elem.updateComplete;
    const title = elem.shadowRoot?.textContent;
    expect(title).toContain("コメント投稿");
  });

  it("フォーム要素（セレクトボックス、テキストエリア、ボタン）が表示されること", async () => {
    await elem.updateComplete;
    const select = elem.shadowRoot?.querySelector("select");
    const textarea = elem.shadowRoot?.querySelector("textarea");
    const button = elem.shadowRoot?.querySelector("button");
    expect(select).toBeTruthy();
    expect(textarea).toBeTruthy();
    expect(button).toBeTruthy();
  });
});
