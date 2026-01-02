import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import "./discussion-list";
import type { LearningDiscussionList } from "./discussion-list";

describe("learning-discussion-list", async () => {
  let elem: LearningDiscussionList;

  beforeEach(() => {
    elem = document.createElement(
      "learning-discussion-list"
    ) as LearningDiscussionList;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("議論のテーマが表示されること", async () => {
    elem.discussions = [
      { id: "1", theme: "テーマ1" },
      { id: "2", theme: "テーマ2" },
    ];
    await expect.element(page.getByText("テーマ1")).toBeInTheDocument();
    await expect.element(page.getByText("テーマ2")).toBeInTheDocument();
  });

  it("議論がない場合にメッセージが表示されること", async () => {
    elem.discussions = [];
    await expect
      .element(page.getByText("No discussions found."))
      .toBeInTheDocument();
  });

  it("削除ボタンをクリックすると onDelete が呼ばれること", async () => {
    let deletedId = "";
    elem.discussions = [{ id: "1", theme: "テーマ1" }];
    elem.onDelete = (d) => {
      deletedId = d.id;
    };
    await elem.updateComplete;

    const deleteButton = elem.shadowRoot?.querySelector(
      ".delete-button"
    ) as HTMLElement;
    expect(deleteButton).not.toBeNull();
    deleteButton.click();

    expect(deletedId).toBe("1");
  });

  it("削除ボタンが絶対配置されていること", async () => {
    elem.discussions = [{ id: "1", theme: "テーマ1" }];
    await elem.updateComplete;

    const deleteButton = elem.shadowRoot?.querySelector(
      ".delete-button"
    ) as HTMLElement;
    const style = window.getComputedStyle(deleteButton);
    expect(style.position).toBe("absolute");
  });

  it("アイテムコンテナが相対配置されていること", async () => {
    elem.discussions = [{ id: "1", theme: "テーマ1" }];
    await elem.updateComplete;

    const item = elem.shadowRoot?.querySelector(".item") as HTMLElement;
    const style = window.getComputedStyle(item);
    expect(style.position).toBe("relative");
  });
});
