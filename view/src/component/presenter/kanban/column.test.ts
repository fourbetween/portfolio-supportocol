import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { KanbanColumnPresenter } from "./column";

describe("KanbanColumnPresenter", async () => {
  let elem: KanbanColumnPresenter;

  beforeEach(() => {
    elem = document.createElement(
      "kanban-column-presenter"
    ) as KanbanColumnPresenter;
    elem.title = "Open";
    elem.count = 2;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("カラムのタイトルが表示されること", async () => {
    const titleElement = elem.renderRoot.querySelector(".column-title");
    expect(titleElement?.textContent?.trim()).toContain("Open");
  });

  it("カラムのカウントが表示されること", async () => {
    const countElement = elem.renderRoot.querySelector(".column-count");
    expect(countElement?.textContent?.trim()).toBe("(2)");
  });

  it("追加ボタンが表示されること", async () => {
    const addButton = elem.renderRoot.querySelector(".add-button");
    expect(addButton).toBeTruthy();
  });

  it("slotが存在すること", async () => {
    const slot = elem.renderRoot.querySelector("slot");
    expect(slot).toBeTruthy();
  });
});
